import React, { useState, FormEvent, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Sparkles, 
  Calendar, 
  Trash2, 
  Check, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Edit2,
  X,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { Task, TaskPriority, SubTask } from "../types";

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onPrioritizeTasksAI: () => Promise<void>;
  aiPrioritizing: boolean;
  autoOpenAddForm?: boolean;
  onResetAutoOpen?: () => void;
}

export default function TasksView({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onPrioritizeTasksAI,
  aiPrioritizing,
  autoOpenAddForm,
  onResetAutoOpen
}: TasksViewProps) {
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"none" | "priority" | "deadline" | "ai">("none");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  
  // Create / Edit Form Values
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState("Work");
  const [estimatedTime, setEstimatedTime] = useState<number>(30);
  const [deadline, setDeadline] = useState("");
  const [recurring, setRecurring] = useState<"none" | "daily" | "weekly" | "monthly">("none");

  // Trigger form open if navigated with autoOpenAddForm
  useEffect(() => {
    if (autoOpenAddForm) {
      resetForm();
      setShowAddForm(true);
      if (onResetAutoOpen) {
        onResetAutoOpen();
      }
    }
  }, [autoOpenAddForm]);

  // AI Breakdown states
  const [breakdownLoadingId, setBreakdownLoadingId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Quick form helpers
  const resetForm = () => {
    setTitle("");
    setNotes("");
    setPriority("medium");
    setCategory("Work");
    setEstimatedTime(30);
    setDeadline("");
    setRecurring("none");
    setEditTaskId(null);
  };

  const handleOpenAddTask = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: Partial<Task> = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      category,
      estimatedTime: Number(estimatedTime) || 30,
      deadline: deadline || undefined,
      recurring,
    };

    if (editTaskId) {
      onUpdateTask(editTaskId, taskData);
    } else {
      onAddTask(taskData);
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleEditTask = (task: Task) => {
    setEditTaskId(task.id);
    setTitle(task.title);
    setNotes(task.notes || "");
    setPriority(task.priority);
    setCategory(task.category);
    setEstimatedTime(task.estimatedTime);
    setDeadline(task.deadline || "");
    setRecurring(task.recurring);
    setShowAddForm(true);
  };

  // AI Breakdown generator
  const triggerAITaskBreakdown = async (task: Task) => {
    setBreakdownLoadingId(task.id);
    try {
      const res = await fetch("/api/gemini/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: task.title,
          taskDescription: task.notes || "",
          estimatedMinutes: task.estimatedTime
        })
      });
      const data = await res.json();
      
      const parsedSubtasks: SubTask[] = data.subtasks.map((st: any) => ({
        id: Math.random().toString(36).substring(2),
        title: st.title,
        durationMinutes: st.durationMinutes,
        isCompleted: false,
        suggestedOrder: st.suggestedOrder,
        rationale: st.rationale
      }));

      onUpdateTask(task.id, {
        subtasks: parsedSubtasks,
        notes: task.notes ? `${task.notes}\n\nAI Breakdown Note: ${data.coachingTip}` : data.coachingTip
      });

      setExpandedTaskId(task.id);
    } catch (err) {
      console.error("AI breakdown failure:", err);
    } finally {
      setBreakdownLoadingId(null);
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string, subtasks: SubTask[]) => {
    const updated = subtasks.map((st) => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdateTask(taskId, { subtasks: updated });
  };

  // Filter and Sort implementation
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    const matchesCategory = categoryFilter ? t.category === categoryFilter : true;
    return matchesSearch && matchesPriority && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "priority") {
      const pLevel = { urgent: 4, high: 3, medium: 2, low: 1 };
      return pLevel[b.priority] - pLevel[a.priority];
    }
    if (sortBy === "deadline") {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === "ai") {
      return (a.suggestedOrder || 99) - (b.suggestedOrder || 99);
    }
    return 0; // standard / none
  });

  const categories = Array.from(new Set(tasks.map((t) => t.category || "General")));

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Task Control Panel</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add, organize, and decompose task milestones manually or using AI assistance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onPrioritizeTasksAI}
            disabled={aiPrioritizing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
            {aiPrioritizing ? "AI Re-arranging..." : "Optimize Prioritization"}
          </button>
          
          <button
            onClick={handleOpenAddTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-slate-900/50 dark:to-violet-950/20 border border-blue-100 dark:border-violet-900/30 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 shadow-sm relative overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-blue-600 dark:text-violet-400" />
          </div>
          <div className="w-16 h-16 bg-blue-600/10 text-blue-600 dark:text-violet-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/15">
            <PlusCircle className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
            Welcome to TaskPilot AI!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 font-sans max-w-md mx-auto leading-relaxed">
            You're all set to take control of your productivity. Create your first task to get started.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleOpenAddTask}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all flex items-center gap-2 hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Create Your First Task
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row gap-3 shadow-sm dark:shadow-none transition-all">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 rounded-xl transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="" className="bg-white dark:bg-slate-950">All Priorities</option>
            <option value="urgent" className="bg-white dark:bg-slate-950">Urgent</option>
            <option value="high" className="bg-white dark:bg-slate-950">High</option>
            <option value="medium" className="bg-white dark:bg-slate-950">Medium</option>
            <option value="low" className="bg-white dark:bg-slate-950">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="" className="bg-white dark:bg-slate-950">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-slate-950">{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="none" className="bg-white dark:bg-slate-950">Standard Sort</option>
            <option value="priority" className="bg-white dark:bg-slate-950">Sort: Priority</option>
            <option value="deadline" className="bg-white dark:bg-slate-950">Sort: Deadline</option>
            <option value="ai" className="bg-white dark:bg-slate-950">Sort: AI Sequence</option>
          </select>
        </div>
      </div>



      {/* Main Tasks List Grid */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isExpanded = expandedTaskId === task.id;
          const totalSub = task.subtasks?.length || 0;
          const completedSub = task.subtasks?.filter(st => st.isCompleted).length || 0;
          const subtaskProgress = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

          return (
            <div 
              key={task.id} 
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl transition-all duration-200 overflow-hidden text-slate-800 dark:text-white shadow-sm dark:shadow-none ${
                task.isCompleted ? "opacity-60" : "hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Task Header Segment */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  
                  {/* Circle Checkmark Button */}
                  <button
                    onClick={() => onUpdateTask(task.id, { isCompleted: !task.isCompleted })}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                      task.isCompleted 
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : "bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-transparent hover:border-blue-500"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`font-bold text-sm tracking-tight text-slate-900 dark:text-white ${task.isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                        {task.title}
                      </h4>
                      {task.suggestedOrder && (
                        <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20">
                          AI Rank #{task.suggestedOrder}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed font-sans">{task.notes}</p>
                    
                    {/* Meta labels row */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-2.5 py-0.5 rounded-full">
                        {task.category}
                      </span>
                      
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        task.priority === "urgent" 
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" 
                          : task.priority === "high"
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                          : task.priority === "medium"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>

                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {task.estimatedTime}m
                      </span>

                      {task.deadline && (
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold bg-blue-50 dark:bg-slate-950 border border-blue-200 dark:border-cyan-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" /> Due: {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations column */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-100 dark:border-slate-800/60 pt-3 md:pt-0 shrink-0">
                  
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border-none bg-transparent"
                      title="Edit objective details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border-none bg-transparent"
                      title="Delete objective"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {/* Breakdown subtasks using AI */}
                    {!task.isCompleted && (
                      <button
                        onClick={() => triggerAITaskBreakdown(task)}
                        disabled={breakdownLoadingId !== null}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md transition-all border-none cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {breakdownLoadingId === task.id ? "Decomposing..." : "AI Breakdown"}
                      </button>
                    )}

                    {totalSub > 0 && (
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        {totalSub} Steps
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtasks block / Milestone Breakdown */}
              {isExpanded && totalSub > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Subtask Progress ({subtaskProgress}%)</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{completedSub}/{totalSub} Finished</span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300" style={{ width: `${subtaskProgress}%` }} />
                  </div>

                  {/* Interconnected Milestones */}
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {task.subtasks?.map((st) => (
                      <div 
                        key={st.id} 
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 p-3.5 flex items-start justify-between hover:border-blue-500 dark:hover:border-blue-500 transition-all rounded-2xl"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleSubtask(task.id, st.id, task.subtasks || [])}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                              st.isCompleted
                                ? "bg-blue-600 border-blue-500 text-white"
                                : "text-transparent bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-500"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight block ${st.isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                              {st.title}
                            </span>
                            {st.rationale && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed font-sans">{st.rationale}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                          {st.durationMinutes}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-12 text-center text-slate-400 dark:text-slate-500 text-xs shadow-sm dark:shadow-none">
            No items matched your filter or search criteria. Launch a new task above!
          </div>
        )}
      </div>
    </>
  )}

      {/* Task Creation Modal overlay (moved outside conditional block to be operational in all states) */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800 dark:text-white transition-all">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-blue-600 dark:text-blue-400">{editTaskId ? "Modify Task Objective" : "Establish New Task"}</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border-none bg-transparent cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g., Deliver Quarterly Sales Deck"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Description / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  rows={3}
                  placeholder="Describe details, references, and criteria..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="low" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">Low</option>
                    <option value="medium" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">Medium</option>
                    <option value="high" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">High</option>
                    <option value="urgent" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">Urgent / Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="e.g., Work, Health, Personal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Estimated Work (min)</label>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    min={5}
                    max={480}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      if (clickX < rect.width - 40) {
                        try {
                          e.currentTarget.showPicker?.();
                        } catch (err) {
                          // Fail silently to avoid browser/environment restriction warnings in iframe
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Recurring Frequency</label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="none" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">One-time Task</option>
                  <option value="daily" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">Daily Habit Schedule</option>
                  <option value="weekly" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">Weekly Checklist</option>
                  <option value="monthly" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">Monthly Audit</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all"
              >
                {editTaskId ? "Update Objective" : "Launch Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
