import { useState } from "react";
import { 
  Sparkles, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Check, 
  Coffee, 
  ShieldAlert, 
  Compass,
  ArrowRight
} from "lucide-react";
import { Task, AIPlanResult, ScheduleBlock } from "../types";

interface PlannerViewProps {
  tasks: Task[];
}

export default function PlannerView({ tasks }: PlannerViewProps) {
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<AIPlanResult | null>(null);

  const handleToggleTaskSelect = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  const handleSelectAll = () => {
    const pendingIds = tasks.filter(t => !t.isCompleted).map(t => t.id);
    if (selectedTaskIds.length === pendingIds.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(pendingIds);
    }
  };

  const handleGenerateSchedule = async () => {
    setLoading(true);
    try {
      const selectedTasksToSubmit = tasks.filter((t) => selectedTaskIds.includes(t.id));
      const res = await fetch("/api/gemini/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableHours,
          tasks: selectedTasksToSubmit,
          preferences: {
            customPrompt: customPrompt || undefined,
            preferredBreakMin: 10,
            pomodoroMode: true
          }
        })
      });

      const data = await res.json();
      setPlanResult(data);
    } catch (err) {
      console.error("Schedule generation failure:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Daily Planner</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Input your free duration, select goals, and let Gemini compile an optimal, balanced schedule block.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - Configurator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 h-fit text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <h3 className="font-bold text-sm">Planner Setup</h3>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Hour input slider */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-2 flex justify-between uppercase">
                <span>Available hours today</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{availableHours} hrs</span>
              </label>
              <input
                type="range"
                min={1}
                max={12}
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-950 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase">
                <span>1h sprint</span>
                <span>6h typical</span>
                <span>12h max</span>
              </div>
            </div>

            {/* Custom guidance instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5">Custom instructions (optional)</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 rounded-xl transition-all"
                rows={2}
                placeholder="e.g., Keep breaks 15 mins. Front-load design tasks before lunch."
              />
            </div>

            {/* Tasks selection box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300">Select tasks to include</label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold uppercase cursor-pointer border-none bg-transparent"
                >
                  {selectedTaskIds.length === tasks.filter(t => !t.isCompleted).length ? "Deselect All" : "Select All Pending"}
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 max-h-56 overflow-y-auto space-y-1.5 rounded-2xl scrollbar-thin">
                {tasks.filter(t => !t.isCompleted).map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <button
                      type="button"
                      key={task.id}
                      onClick={() => handleToggleTaskSelect(task.id)}
                      className={`w-full text-left p-2 flex items-start gap-2.5 transition-all text-xs border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl cursor-pointer ${
                        isSelected 
                          ? "bg-blue-50/50 dark:bg-slate-900 border-blue-500/30 text-slate-950 dark:text-white font-bold" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 bg-white dark:bg-slate-950 ${
                        isSelected ? "bg-blue-600 border-blue-500 text-white" : "border-slate-300 dark:border-slate-700 text-transparent"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold block truncate leading-tight">{task.title}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block uppercase">Priority: {task.priority} • {task.estimatedTime}m</span>
                      </div>
                    </button>
                  );
                })}

                {tasks.filter(t => !t.isCompleted).length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-mono uppercase">
                    No active tasks to plan.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateSchedule}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all disabled:opacity-50"
            >
              {loading ? "Constructing Schedule..." : "Generate AI Timeline Block"}
            </button>
          </div>
        </div>

        {/* Right column - AI Output Schedule View */}
        <div className="lg:col-span-2 space-y-6">
          
          {planResult ? (
            <div className="space-y-6">
              
              {/* Insight banner card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col md:flex-row gap-4 items-center text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-500/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">Co-pilot Insight</span>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ~{planResult.estimatedCompletionRate}% success forecast
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-sans">{planResult.coachInsight}</p>
                </div>
              </div>

              {/* Vertical Timeline container */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all">
                <h3 className="font-bold text-sm tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3 text-slate-900 dark:text-white">Today's Sequence Blocks</h3>
                
                <div className="relative border-l border-slate-250 dark:border-slate-800 pl-6 ml-3 space-y-6">
                  {planResult.scheduleBlocks.map((block, idx) => {
                    const isFocus = block.type === "focus";
                    const isBreak = block.type === "break";

                    return (
                      <div key={idx} className="relative group">
                        
                        {/* Dot Bullet */}
                        <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border border-white dark:border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isFocus 
                            ? "bg-blue-600 border-blue-400" 
                            : isBreak 
                            ? "bg-emerald-500 border-emerald-400" 
                            : "bg-slate-400 border-slate-300"
                        }`}>
                          <div className="w-1 h-1 bg-white dark:bg-slate-950 rounded-full" />
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all rounded-2xl">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                              {block.startTime} — {block.endTime} ({block.type.toUpperCase()})
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              {isBreak ? <Coffee className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                              {block.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg leading-normal font-sans">{block.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-24 text-center space-y-4 shadow-sm dark:shadow-none transition-all">
              <Compass className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">No AI Timeline Rendered</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">Specify your daily bounds on the left and tap generate to plan your focus blocks.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
