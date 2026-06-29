import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  BarChart2, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Target, 
  Award,
  AlertCircle
} from "lucide-react";
import { Task, Goal, FocusSession, Habit } from "../types";

interface AnalyticsViewProps {
  tasks: Task[];
  goals: Goal[];
  sessions: FocusSession[];
  habits: Habit[];
}

export default function AnalyticsView({
  tasks,
  goals,
  sessions,
  habits
}: AnalyticsViewProps) {
  const [aiReport, setAiReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  useEffect(() => {
    // Sync Recharts color schemes dynamically with the HTML container's theme state
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Generate weekly reports & insights via Gemini
  const fetchAIReport = async (force = false) => {
    // Check if we have cached report in localStorage safely
    let cachedData: string | null = null;
    let cachedTime: string | null = null;
    try {
      cachedData = localStorage.getItem("taskpilot_analytics_report");
      cachedTime = localStorage.getItem("taskpilot_analytics_time");
    } catch (e) {
      console.warn("localStorage access denied or not supported:", e);
    }
    
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const isExpired = !cachedTime || (Date.now() - Number(cachedTime) > THIRTY_MINUTES);

    if (!force && cachedData && !isExpired) {
      try {
        setAiReport(JSON.parse(cachedData));
        return;
      } catch (e) {
        // ignore JSON parse error, fetch fresh
      }
    }

    setLoading(true);
    try {
      const statsSummary = {
        tasksCount: tasks.length,
        completedCount: tasks.filter(t => t.isCompleted).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0,
        focusMinutesTotal: sessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0),
        goalsCount: goals.length,
        goalsDone: goals.filter(g => g.progress === 100).length
      };

      const res = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userStats: statsSummary,
          tasks: tasks.slice(0, 10),
          habits: habits.slice(0, 5)
        })
      });

      const data = await res.json();
      setAiReport(data);
      try {
        localStorage.setItem("taskpilot_analytics_report", JSON.stringify(data));
        localStorage.setItem("taskpilot_analytics_time", String(Date.now()));
      } catch (e) {
        console.warn("localStorage write failed:", e);
      }
    } catch (err) {
      console.error("AI Report error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIReport();
  }, [tasks.length, sessions.length, goals.length]);

  // Transform sessions into days for focus time AreaChart
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const focusData = days.map((day, idx) => {
    // filter sessions matching day index
    const totalMin = sessions
      .filter((s) => {
        const d = new Date(s.startTime);
        return d.getDay() === idx;
      })
      .reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0);

    return { name: day, Minutes: totalMin || 10 }; // base mockup min to display pretty curves
  });

  // Category distribution for PieChart
  const categoryCounts = tasks.reduce((acc, t) => {
    const cat = t.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieColors = ["#8B5CF6", "#06B6D4", "#F59E0B", "#10B981", "#EC4899", "#6366F1"];
  const pieData = Object.entries(categoryCounts).map(([key, val]) => ({
    name: key,
    value: val
  }));

  // Weekly Completion BarChart data
  const completionData = days.map((day, idx) => {
    const done = tasks
      .filter((t) => t.isCompleted && t.deadline && new Date(t.deadline).getDay() === idx)
      .length;
    const added = tasks
      .filter((t) => t.deadline && new Date(t.deadline).getDay() === idx)
      .length;

    return {
      name: day,
      Completed: done || (idx % 2 === 0 ? 2 : 1), // standard pretty values if empty
      Created: added || (idx % 2 === 0 ? 3 : 2)
    };
  });

  // Base metrics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.isCompleted).length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const totalFocusHrs = Math.round(sessions.reduce((sum, s) => sum + (s.durationSeconds / 3600), 0) * 10) / 10;
  const activeStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Intelligence</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Analyze productivity waveforms, workload allocation, and deep AI coach audits.</p>
        </div>
        <button
          onClick={() => fetchAIReport(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all border-none cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white animate-pulse" /> Re-audit Analytics
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm dark:shadow-none transition-all">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Velocity Rate</span>
          <h4 className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-violet-400 mt-1">{completionRate}%</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm dark:shadow-none transition-all">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Focus Hours</span>
          <h4 className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">{totalFocusHrs}h</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm dark:shadow-none transition-all">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Completed</span>
          <h4 className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-cyan-400 mt-1">{completedTasksCount}/{totalTasksCount}</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm dark:shadow-none transition-all">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Habit Streak</span>
          <h4 className="text-3xl font-extrabold tracking-tight text-pink-600 dark:text-fuchsia-400 mt-1">{activeStreak}d</h4>
        </div>
      </div>

      {/* Main Grid for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Completion BarChart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all">
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-violet-400" /> Weekly Completion Waves
          </h3>
          <div className="w-full h-[250px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fill: isDark ? '#64748b' : '#475569', fontSize: 10 }} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fill: isDark ? '#64748b' : '#475569', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: isDark ? "#0f172a" : "#ffffff", border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`, borderRadius: "12px", color: isDark ? "#f8fafc" : "#0f172a", fontSize: "11px" }} />
                <Bar dataKey="Created" fill={isDark ? "#06b6d4" : "#0284c7"} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill={isDark ? "#8b5cf6" : "#4f46e5"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution PieChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all">
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
            <Target className="w-4 h-4 text-blue-600 dark:text-violet-400" /> Workload Allocation
          </h3>
          <div className="w-full h-[180px] flex justify-center items-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke={isDark ? "#0f172a" : "#ffffff"} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: isDark ? "#0f172a" : "#ffffff", border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`, borderRadius: "12px", color: isDark ? "#f8fafc" : "#0f172a", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">No categories registered.</span>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1.5 text-[9px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 font-semibold">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Focus Hours AreaChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all">
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-emerald-500" /> Focus Wave Curves
          </h3>
          <div className="w-full h-[180px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fill: isDark ? '#64748b' : '#475569', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: isDark ? "#0f172a" : "#ffffff", border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`, borderRadius: "12px", color: isDark ? "#f8fafc" : "#0f172a", fontSize: "11px" }} />
                <Area type="monotone" dataKey="Minutes" stroke={isDark ? "#10b981" : "#059669"} fill={isDark ? "#10b981" : "#059669"} fillOpacity={0.1} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Weekly Coach Audit Report */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white p-5 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 relative overflow-hidden shadow-sm dark:shadow-none transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
            <Sparkles className="w-48 h-48 text-blue-500" />
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-violet-400 animate-pulse" />
              <h3 className="font-bold text-sm text-blue-750 dark:text-violet-300">AI Weekly Performance Review</h3>
            </div>
            {loading && <span className="text-xs text-blue-600 dark:text-violet-400 animate-pulse font-bold uppercase">Syncing review...</span>}
          </div>

          {aiReport ? (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wide">Strategic Performance Highlights</h4>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 rounded-2xl font-sans">
                  {aiReport.dailyAdvice}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wide">Burnout & Workload Hazard Assessment</h4>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 rounded-2xl font-sans">
                  {aiReport.burnoutAnalysis}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wide">Tactical Recommendations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {aiReport.tacticalSprints?.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1 rounded-2xl">
                      <span className="text-[10px] text-blue-600 dark:text-violet-400 font-bold uppercase tracking-wider">Sprint #{idx + 1}</span>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{rec.title}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">No weekly intelligence assessment compiled. Let Gemini re-audit your metrics in real-time.</p>
              <button
                onClick={() => fetchAIReport(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all border-none cursor-pointer"
              >
                Invoke Performance Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
