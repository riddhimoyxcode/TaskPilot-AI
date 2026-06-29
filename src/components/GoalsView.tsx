import React, { useState, FormEvent } from "react";
import { 
  Plus, 
  Target, 
  Calendar, 
  Trash2, 
  Check, 
  Trophy, 
  ChevronRight, 
  PlusCircle, 
  X,
  Sparkles,
  Award
} from "lucide-react";
import { Goal, GoalMilestone } from "../types";

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Partial<Goal>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: string) => void;
}

export default function GoalsView({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}: GoalsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  
  // Milestones input builder
  const [milestonesInput, setMilestonesInput] = useState<string[]>([""]);

  const handleAddMilestoneField = () => {
    setMilestonesInput([...milestonesInput, ""]);
  };

  const handleRemoveMilestoneField = (index: number) => {
    const updated = [...milestonesInput];
    updated.splice(index, 1);
    setMilestonesInput(updated);
  };

  const handleMilestoneValueChange = (index: number, val: string) => {
    const updated = [...milestonesInput];
    updated[index] = val;
    setMilestonesInput(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const milestones: GoalMilestone[] = milestonesInput
      .filter((m) => m.trim() !== "")
      .map((m) => ({
        id: Math.random().toString(36).substring(2),
        title: m.trim(),
        isCompleted: false
      }));

    onAddGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      milestones,
      progress: 0,
    });

    setTitle("");
    setDescription("");
    setTargetDate("");
    setMilestonesInput([""]);
    setShowAddForm(false);
  };

  const handleToggleMilestone = (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );

    const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
    const progress = updatedMilestones.length > 0 
      ? Math.round((completedCount / updatedMilestones.length) * 100) 
      : 0;

    onUpdateGoal(goal.id, {
      milestones: updatedMilestones,
      progress
    });
  };

  // Calculations for static achievements list
  const fullyCompletedGoals = goals.filter((g) => g.progress === 100);
  const milestonesCompletedTotal = goals.reduce((sum, g) => sum + g.milestones.filter(m => m.isCompleted).length, 0);

  const achievements = [
    { title: "Strategic Launcher", desc: "Establish your first major Goal", unlocked: goals.length > 0 },
    { title: "Milestone Crusher", desc: "Complete 5 distinct milestones", unlocked: milestonesCompletedTotal >= 5 },
    { title: "Unstoppable Victor", desc: "Reach 100% on any major goal", unlocked: fullyCompletedGoals.length > 0 },
    { title: "Triple Crown", desc: "Accomplish 3 complete goals", unlocked: fullyCompletedGoals.length >= 3 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Strategic Vision Board</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Map long-term visions, establish milestone increments, and lock in pilot achievements.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all border-none cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white stroke-[3]" /> Add Strategic Goal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - Goals Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {goals.map((goal) => {
            const completed = goal.milestones.filter(m => m.isCompleted).length;
            const total = goal.milestones.length;

            return (
              <div key={goal.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-slate-800 dark:text-white space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm dark:shadow-none">
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/15 flex items-center justify-center rounded-2xl shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{goal.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-sans">{goal.description}</p>
                      
                      {goal.targetDate && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-cyan-400 mt-2.5 bg-blue-50 dark:bg-slate-950 px-2.5 py-1 rounded-full border border-blue-150 dark:border-cyan-500/10">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" /> Target Date: {goal.targetDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operations */}
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                    title="Delete goal objectives"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar container */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-300">
                    <span>Progress Flow Rate</span>
                    <span className="text-emerald-500 font-bold">{goal.progress}% Secured</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full border border-slate-200 dark:border-slate-800/60 overflow-hidden relative">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mt-1">
                    {completed} of {total} Milestones Accomplished
                  </span>
                </div>

                {/* Milestones checklist dropdown */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">Detailed Milestones Checklist</h4>
                  
                  <div className="space-y-2.5">
                    {goal.milestones.map((m) => (
                      <div 
                        key={m.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 p-3 flex items-start gap-3 hover:border-blue-500/50 transition-all rounded-xl"
                      >
                        <button
                          onClick={() => handleToggleMilestone(goal, m.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer bg-slate-100 dark:bg-slate-950 ${
                            m.isCompleted
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "border-slate-300 dark:border-slate-700 text-transparent hover:border-blue-500"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className={`text-xs leading-tight ${m.isCompleted ? "line-through text-slate-400 dark:text-slate-500 font-normal" : "text-slate-800 dark:text-slate-200 font-semibold"}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}

                    {goal.milestones.length === 0 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 py-1 font-mono uppercase">No detailed milestones registered under this goal.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-16 text-center text-slate-500 dark:text-slate-400 text-xs shadow-sm dark:shadow-none transition-all">
              No vision objectives configured. Map a new vision at the top to launch pilot missions.
            </div>
          )}
        </div>

        {/* Right column - Achievements */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all">
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
              <Trophy className="w-5 h-5 text-amber-500 animate-pulse" /> Pilot Achievements
            </h3>

            <div className="space-y-3">
              {achievements.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3.5 border border-slate-200 dark:border-slate-800/85 rounded-2xl flex gap-3.5 items-center transition-all bg-slate-50 dark:bg-slate-950/40 ${
                    item.unlocked 
                      ? "" 
                      : "opacity-40 select-none border-dashed"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    item.unlocked 
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                      : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-650"
                  }`}>
                    <Award className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-none uppercase">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{item.desc}</p>
                    {item.unlocked && (
                      <span className="text-[8px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded-full inline-block mt-1.5 uppercase">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goal creation Modal overlay */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-800 dark:text-white space-y-5 max-h-[90vh] overflow-y-auto transition-all">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">Define Strategic Vision</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border-none bg-transparent cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Goal vision title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g., Launch SaaS MVP Build"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Impact Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  rows={2}
                  placeholder="Describe why this goal is critical..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Strategic Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch (err) {
                      console.warn("showPicker is restricted in this environment:", err);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                />
              </div>

              {/* Milestones list builder */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300">Detailed Milestones Checklist</label>
                  <button
                    type="button"
                    onClick={handleAddMilestoneField}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer border-none bg-transparent"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Milestone Step
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl scrollbar-thin">
                  {milestonesInput.map((val, idx) => (
                    <div key={idx} className="flex gap-2 items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 px-1">#{idx + 1}</span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleMilestoneValueChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="e.g., Deploy auth stack"
                      />
                      {milestonesInput.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestoneField(idx)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer border-none bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer border-none transition-all"
              >
                Launch Strategic Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
