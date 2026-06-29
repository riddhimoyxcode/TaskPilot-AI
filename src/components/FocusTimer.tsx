import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, Target, Volume2, VolumeX, Sparkles, AlertCircle, History } from "lucide-react";
import { Task, FocusSession } from "../types";
import { db, handleFirestoreError, OperationType, cleanFirestorePayload } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FocusTimerProps {
  tasks: Task[];
  userId: string;
  onSessionLogged: (session: FocusSession) => void;
  workMinutes?: number;
  breakMinutes?: number;
}

export default function FocusTimer({
  tasks,
  userId,
  onSessionLogged,
  workMinutes = 25,
  breakMinutes = 5
}: FocusTimerProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [timerMode, setTimerMode] = useState<"work" | "break">("work");
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [distractionFree, setDistractionFree] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string>("");

  // Synthesize soft, elegant bell/chime using Web Audio API (cross-platform, zero dependencies)
  const playAlertSound = (type: "work" | "break") => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, dur: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(vol, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        
        osc.type = "sine";
        osc.start(start);
        osc.stop(start + dur);
      };

      if (type === "work") {
        // High double chime
        playTone(523.25, ctx.currentTime, 0.4, 0.15); // C5
        playTone(659.25, ctx.currentTime + 0.15, 0.6, 0.15); // E5
      } else {
        // Low descending chime
        playTone(440.00, ctx.currentTime, 0.4, 0.15); // A4
        playTone(349.23, ctx.currentTime + 0.15, 0.6, 0.15); // F4
      }
    } catch (e) {
      console.warn("Audio Context failed to load", e);
    }
  };

  useEffect(() => {
    setMinutes(timerMode === "work" ? workMinutes : breakMinutes);
    setSeconds(0);
  }, [timerMode, workMinutes, breakMinutes]);

  useEffect(() => {
    if (isActive) {
      if (!startTimeRef.current && timerMode === "work") {
        startTimeRef.current = new Date().toISOString();
      }

      timerRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prev) => prev - 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    playAlertSound(timerMode);

    if (timerMode === "work") {
      setShowSummaryModal(true);
    } else {
      setTimerMode("work");
      setMinutes(workMinutes);
      setSeconds(0);
      startTimeRef.current = "";
    }
  };

  const handleSaveSessionSummary = async () => {
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    const durationSec = workMinutes * 60;

    const newSession: FocusSession = {
      id: Math.random().toString(36).substring(2),
      taskId: selectedTaskId || undefined,
      taskTitle: selectedTask?.title || "General Focus",
      startTime: startTimeRef.current || new Date().toISOString(),
      durationSeconds: durationSec,
      completed: true,
      userId,
      rating,
      notes: sessionNotes
    };

    try {
      // Sync to Firestore
      await addDoc(collection(db, "sessions"), cleanFirestorePayload({
        ...newSession,
        createdAt: serverTimestamp()
      }));
      onSessionLogged(newSession);
    } catch (err) {
      console.error("Error logging focus session:", err);
      // Fallback local trigger
      onSessionLogged(newSession);
      handleFirestoreError(err, OperationType.CREATE, "sessions");
    }

    // Reset timer
    setShowSummaryModal(false);
    setTimerMode("break");
    setMinutes(breakMinutes);
    setSeconds(0);
    setSessionNotes("");
    setRating(5);
    startTimeRef.current = "";
  };

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(timerMode === "work" ? workMinutes : breakMinutes);
    setSeconds(0);
    startTimeRef.current = "";
  };

  const totalTime = timerMode === "work" ? workMinutes * 60 : breakMinutes * 60;
  const timeRemaining = minutes * 60 + seconds;
  const progressPercent = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl transition-all shadow-sm dark:shadow-none ${distractionFree ? "p-0" : "p-6"}`}>
      
      {/* Distraction Free Overlay */}
      {distractionFree && isActive && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white z-50 flex flex-col items-center justify-center p-6 transition-all duration-500">
          <button
            onClick={() => setDistractionFree(false)}
            className="absolute top-6 right-6 px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all rounded-xl cursor-pointer border-none shadow-lg shadow-blue-500/25"
          >
            Exit Solo Mode
          </button>
          
          <div className="text-center space-y-6 max-w-md w-full">
            <span className="text-xs font-semibold uppercase bg-blue-600/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20 font-sans tracking-wider">
              {timerMode === "work" ? "Deep Focus Session" : "Rest Mode"}
            </span>
            <div className="text-8xl md:text-9xl font-bold font-sans tracking-tight tabular-nums text-blue-600 dark:text-blue-400 drop-shadow-[0_4px_24px_rgba(37,99,235,0.15)]">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            {selectedTaskId && (
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                Tackling: <span className="text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 ml-1.5">{tasks.find(t => t.id === selectedTaskId)?.title}</span>
              </p>
            )}
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={handleToggle}
                className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20 cursor-pointer border-none"
              >
                {isActive ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
              <button
                onClick={handleReset}
                className="w-16 h-16 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Normal timer render */}
      {!distractionFree && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white tracking-wider">Focus Engine v2.0</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all cursor-pointer border-none bg-transparent"
                title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setDistractionFree(true)}
                disabled={!isActive}
                className={`text-[10px] font-bold rounded-xl px-3 py-1.5 cursor-pointer transition-all border-none ${
                  isActive 
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20" 
                    : "bg-slate-100 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent"
                }`}
                title="Only available while timer is running"
              >
                Solo Mode
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6 items-center">
            {/* Visual Progress Dial */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-slate-100 dark:stroke-slate-950 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className={`fill-none transition-all duration-300 ${timerMode === "work" ? "stroke-blue-600" : "stroke-emerald-500"}`}
                  strokeWidth="10"
                  strokeDasharray={439.82}
                  strokeDashoffset={439.82 - (439.82 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${timerMode === "work" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  {timerMode === "work" ? "FOCUS" : "BREAK"}
                </span>
                <span className="text-3xl font-bold font-sans tracking-tight tabular-nums text-slate-900 dark:text-white mt-2">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-semibold">
                  {Math.round(progressPercent)}% DONE
                </span>
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Focus Target
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">-- General Block (No Task) --</option>
                  {tasks.filter(t => !t.isCompleted).map((task) => (
                    <option key={task.id} value={task.id} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
                      [{task.priority.toUpperCase()}] {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggle}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all active:scale-[0.98]"
                >
                  {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isActive ? "Pause Focus" : "Start Focus"}
                </button>

                <button
                  onClick={handleReset}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsActive(false);
                    setTimerMode("work");
                    setMinutes(workMinutes);
                    setSeconds(0);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all border-none ${
                    timerMode === "work"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white dark:hover:bg-slate-900"
                  }`}
                >
                  Work ({workMinutes}m)
                </button>
                <button
                  onClick={() => {
                    setIsActive(false);
                    setTimerMode("break");
                    setMinutes(breakMinutes);
                    setSeconds(0);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all border-none ${
                    timerMode === "break"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/25"
                      : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white dark:hover:bg-slate-900"
                  }`}
                >
                  Break ({breakMinutes}m)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Focus Summary Log Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-5 rounded-3xl animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-violet-400 mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold">Focus Cycle Completed!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Excellent flow state achieved. Let's document your results.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-2">Rate Focus Intensity</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-9 h-9 font-bold rounded-xl transition-all border-none cursor-pointer ${
                        rating >= star
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500"
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5">Session Micro-Logs</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  rows={3}
                  placeholder="Completed first draft of the summary... feeling motivated!"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSessionSummary}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all active:scale-[0.98]"
            >
              Log Session & Take Break
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
