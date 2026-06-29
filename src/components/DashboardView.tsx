import React, { useState, useEffect, FormEvent } from "react";
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Flame, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Plus,
  PlusCircle
} from "lucide-react";
import { Task, Goal, Habit, FocusSession, Notification } from "../types";
import FocusTimer from "./FocusTimer";

interface DashboardViewProps {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  sessions: FocusSession[];
  notifications: Notification[];
  onAddTask: (task: Partial<Task>) => void;
  userId: string;
  onSessionLogged: (session: FocusSession) => void;
  onRefreshStats: () => void;
  onNavigateToTasks?: () => void;
}

export default function DashboardView({
  tasks,
  goals,
  habits,
  sessions,
  notifications,
  onAddTask,
  userId,
  onSessionLogged,
  onRefreshStats,
  onNavigateToTasks
}: DashboardViewProps) {
  const [coachingAdvice, setCoachingAdvice] = useState<any>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  const fetchCoachingAdvice = async (force = false) => {
    // Check if we have cached advice in localStorage safely
    let cachedData: string | null = null;
    let cachedTime: string | null = null;
    try {
      cachedData = localStorage.getItem("taskpilot_coach_advice");
      cachedTime = localStorage.getItem("taskpilot_coach_time");
    } catch (e) {
      console.warn("localStorage access denied or not supported:", e);
    }
    
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const isExpired = !cachedTime || (Date.now() - Number(cachedTime) > THIRTY_MINUTES);

    if (!force && cachedData && !isExpired) {
      try {
        setCoachingAdvice(JSON.parse(cachedData));
        return;
      } catch (e) {
        // ignore JSON parse error, fetch fresh
      }
    }

    setLoadingCoach(true);
    try {
      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.isCompleted).length,
        totalSessions: sessions.length,
        totalMinutes: sessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0),
        streakDays: habits.reduce((max, h) => Math.max(max, h.streak), 0)
      };

      const res = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userStats: stats,
          tasks: tasks.filter(t => !t.isCompleted).slice(0, 5),
          habits: habits.slice(0, 5)
        })
      });
      const data = await res.json();
      setCoachingAdvice(data);
      try {
        localStorage.setItem("taskpilot_coach_advice", JSON.stringify(data));
        localStorage.setItem("taskpilot_coach_time", String(Date.now()));
      } catch (e) {
        console.warn("localStorage write failed:", e);
      }
    } catch (err) {
      console.error("Coaching failed:", err);
    } finally {
      setLoadingCoach(false);
    }
  };

  useEffect(() => {
    fetchCoachingAdvice();
  }, [tasks.length, habits.length, sessions.length]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onAddTask({
      title: quickTaskTitle.trim(),
      priority: "medium",
      category: "General",
      estimatedTime: 25,
      recurring: "none"
    });
    setQuickTaskTitle("");
  };

  // Calculations for stats boxes
  const completedTodayCount = tasks.filter((t) => t.isCompleted).length;
  const pendingTodayCount = tasks.filter((t) => !t.isCompleted).length;
  const totalTodayCount = completedTodayCount + pendingTodayCount;
  const todayProgress = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  const totalFocusMin = sessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0);
  const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // Productivity Score Calculation (Composite Index)
  const taskRate = totalTodayCount > 0 ? completedTodayCount / totalTodayCount : 0.5;
  const scoreBase = Math.round((taskRate * 50) + (Math.min(totalFocusMin / 60, 5) * 10) + (currentStreak * 5));
  const productivityScore = Math.min(100, Math.max(10, scoreBase));

  // Current Date Formatting
  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors">
        <div>
          <span className="text-xs font-bold uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20 font-sans tracking-wide">{todayDateStr}</span>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-900 dark:text-white mt-3">Welcome back, Pilot!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your AI co-pilot is locked in and measuring your productivity spectrums.</p>
        </div>
        <button
          onClick={() => {
            onRefreshStats();
            fetchCoachingAdvice(true);
          }}
          className="self-start inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" /> Sync Intelligence
        </button>
      </div>

      {/* Main Grid for Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today's Progress Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4 text-slate-800 dark:text-white transition-all">
          <div className="w-11 h-11 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/15">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block">Today's Progress</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{todayProgress}%</h4>
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 mt-2 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${todayProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4 text-slate-800 dark:text-white transition-all">
          <div className="w-11 h-11 bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center shrink-0 border border-cyan-500/15">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block">Productivity Score</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{productivityScore}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Based on task velocity</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4 text-slate-800 dark:text-white transition-all">
          <div className="w-11 h-11 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/15">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block">Active Streak</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{currentStreak} Days</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Complete daily habits</p>
          </div>
        </div>

        {/* Focus Hours */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4 text-slate-800 dark:text-white transition-all">
          <div className="w-11 h-11 bg-rose-600/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shrink-0 border border-rose-500/15">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block">Focus Duration</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalFocusMin} Min</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Pomodoro sessions</p>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - Tasks, Quick Add, Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Advice Center */}
          <div id="ai-coaching-brief-card" className="bg-gradient-to-tr from-slate-50/50 to-blue-50/50 dark:from-slate-900 dark:to-violet-950 text-slate-800 dark:text-white p-6 relative overflow-hidden rounded-3xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-violet-900/30 transition-all">
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 dark:opacity-10 pointer-events-none">
              <Sparkles className="w-64 h-64 text-blue-600 dark:text-violet-600 animate-spin" style={{ animationDuration: '30s' }} />
            </div>
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-violet-900/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-violet-300 animate-pulse" />
                <span className="text-xs font-bold uppercase text-blue-600 dark:text-violet-300 font-sans tracking-wide">AI Co-Pilot Strategy Brief</span>
              </div>
              {loadingCoach && (
                <span className="text-[10px] bg-blue-100 dark:bg-violet-600/30 text-blue-600 dark:text-violet-200 font-bold px-2 py-0.5 rounded-full animate-pulse">
                  Syncing Intel...
                </span>
              )}
            </div>

            {coachingAdvice ? (
              <div className="space-y-4">
                <div className="bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold text-blue-600 dark:text-violet-300 uppercase mb-1">🎯 Daily Focus Highlight</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">{coachingAdvice.dailyAdvice}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-3 rounded-2xl">
                    <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Burnout Hazard Status</h4>
                    <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      coachingAdvice.burnoutRisk === "High" 
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" 
                        : coachingAdvice.burnoutRisk === "Medium"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}>
                      {coachingAdvice.burnoutRisk} Risk
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-3 rounded-2xl">
                    <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Weekly Blueprint Insight</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">{coachingAdvice.weeklyStrategy}</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-violet-950/30 border border-blue-100 dark:border-violet-900/20 p-3.5 text-xs flex items-start gap-2.5 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-200 italic leading-snug">"{coachingAdvice.motivationalQuote}"</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4 bg-white/40 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                <p className="text-xs text-slate-500 dark:text-slate-300">No active AI Briefing synced yet. Tap below to invoke TaskPilot Intelligence.</p>
                <button
                  onClick={() => fetchCoachingAdvice(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 cursor-pointer transition-all border-none"
                >
                  Retrieve Briefing
                </button>
              </div>
            )}
          </div>

          {/* Quick Task Add Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition-all">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Plus className="w-4 h-4 text-blue-600 dark:text-violet-400" /> Fast Task Launcher
            </h3>
            <form onSubmit={handleQuickAdd} className="flex gap-3">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="What's the immediate focus? (e.g. Draft pitch deck)"
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-xl"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all"
              >
                Launch
              </button>
            </form>
          </div>

          {/* Today's Tasks */}
          {tasks.length === 0 ? (
            <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-slate-900/40 dark:to-violet-950/15 border border-blue-100 dark:border-violet-900/30 rounded-3xl p-6 sm:p-8 text-center shadow-sm relative overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="w-24 h-24 text-blue-600 dark:text-violet-400" />
              </div>
              <div className="w-12 h-12 bg-blue-600/10 text-blue-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/15">
                <PlusCircle className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                Welcome to TaskPilot AI!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-sans max-w-sm mx-auto leading-relaxed">
                You're all set to take control of your productivity. Create your first task to get started.
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  onClick={onNavigateToTasks}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all flex items-center gap-1.5 hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Your First Task
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 transition-all">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white tracking-wider">Remaining Workload Today</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  {tasks.filter(t => !t.isCompleted).length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {tasks.filter(t => !t.isCompleted).slice(0, 4).map((task) => (
                  <div key={task.id} className="group border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-500 transition-all rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        task.priority === "urgent" || task.priority === "high" 
                          ? "bg-rose-500 animate-pulse" 
                          : task.priority === "medium" 
                          ? "bg-amber-500" 
                          : "bg-slate-400"
                      }`} />
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{task.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {task.category.toUpperCase()} • {task.estimatedTime}m
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                ))}

                {tasks.filter(t => !t.isCompleted).length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                    All Clean! No pending tasks left today. 🎉
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Focus Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 transition-all">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-blue-600 dark:text-violet-400" /> Focus Log History
            </h3>

            <div className="space-y-3">
              {sessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{session.taskTitle || "General Focus block"}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Completed: {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">+{Math.round(session.durationSeconds / 60)}m</span>
                    <div className="flex gap-0.5 mt-1 justify-end">
                      {Array.from({ length: session.rating || 5 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-violet-500" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                  No focus blocks logged yet. Use Focus Engine.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Focus Engine Sidebar, System Notifications */}
        <div className="space-y-6">
          
          {/* Integrated Focus Engine */}
          <FocusTimer
            tasks={tasks}
            userId={userId}
            onSessionLogged={onSessionLogged}
          />

          {/* Dynamic Notifications Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 tracking-wider">
                <Calendar className="w-4 h-4 text-slate-400" /> Alerts Feed
              </h3>
              <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-bold">
                {notifications.filter(n => !n.isRead).length} New
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-start gap-2.5">
                  <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${
                    notif.type === "deadline" ? "bg-rose-500 animate-pulse" : "bg-blue-400 dark:bg-violet-400"
                  }`} />
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-white">{notif.title}</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold mt-1.5 block">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                  Your alert feed is empty.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
