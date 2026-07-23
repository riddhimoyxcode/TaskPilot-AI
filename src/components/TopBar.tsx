import { useState, useEffect, useRef } from "react";
import { Search, Bell, Sparkles, User, ShieldAlert, CheckCircle2, CheckSquare, Target, Flame, Clock } from "lucide-react";
import { Notification, Task, Goal, Habit, FocusSession } from "../types";

interface TopBarProps {
  notifications: Notification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userDisplayName: string | null;
  isAnonymous: boolean;
  onOpenAssistant: () => void;
  onMarkNotificationsRead?: () => void;
  tasks?: Task[];
  goals?: Goal[];
  habits?: Habit[];
  sessions?: FocusSession[];
}

export default function TopBar({
  notifications,
  activeTab,
  setActiveTab,
  userDisplayName,
  isAnonymous,
  onOpenAssistant,
  onMarkNotificationsRead,
  tasks = [],
  goals = [],
  habits = [],
  sessions = []
}: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Keydown listener for global hotkey to focus (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, []);

  // Click outside listener to collapse search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredTasks = cleanQuery
    ? tasks.filter(t => 
        t.title.toLowerCase().includes(cleanQuery) || 
        (t.notes && t.notes.toLowerCase().includes(cleanQuery)) ||
        t.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredGoals = cleanQuery
    ? goals.filter(g => 
        g.title.toLowerCase().includes(cleanQuery) || 
        (g.description && g.description.toLowerCase().includes(cleanQuery))
      )
    : [];

  const filteredHabits = cleanQuery
    ? habits.filter(h => 
        h.title.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredSessions = cleanQuery
    ? sessions.filter(s => 
        (s.taskTitle && s.taskTitle.toLowerCase().includes(cleanQuery)) || 
        (s.notes && s.notes.toLowerCase().includes(cleanQuery))
      )
    : [];

  const totalResultsCount = filteredTasks.length + filteredGoals.length + filteredHabits.length + filteredSessions.length;
  const hasResults = totalResultsCount > 0;

  const handleSelectResult = (tabId: string) => {
    setActiveTab(tabId);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (filteredTasks.length > 0) {
        handleSelectResult("tasks");
      } else if (filteredGoals.length > 0) {
        handleSelectResult("goals");
      } else if (filteredHabits.length > 0) {
        handleSelectResult("dashboard");
      } else if (filteredSessions.length > 0) {
        handleSelectResult("dashboard");
      }
    }
  };

  return (
    <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm dark:shadow-none transition-colors duration-300">
      
      {/* Search Input Container */}
      <div ref={containerRef} className="relative flex-1 max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tasks, goals, habits, or AI suggestions... (⌘K)"
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] text-slate-400 dark:text-slate-500 rounded-md font-mono">
          ⌘K
        </div>

        {/* Floating Search Dropdown */}
        {isDropdownOpen && searchQuery.trim() !== "" && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto space-y-4 text-slate-800 dark:text-white transition-all animate-in fade-in zoom-in-95 duration-150">
            
            {!hasResults && (
              <p className="text-center text-xs text-slate-400 py-6">No results found for "{searchQuery}"</p>
            )}

            {hasResults && (
              <div className="space-y-4">
                
                {/* Tasks Section */}
                {filteredTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-1 pb-1 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks</span>
                    </div>
                    <div className="space-y-1">
                      {filteredTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleSelectResult("tasks")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all border-none bg-transparent cursor-pointer flex justify-between items-center"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 block truncate">{task.title}</span>
                            {task.notes && <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{task.notes}</span>}
                          </div>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                            task.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500' :
                            task.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>{task.priority}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goals Section */}
                {filteredGoals.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-1 pb-1 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goals</span>
                    </div>
                    <div className="space-y-1">
                      {filteredGoals.map(goal => (
                        <button
                          key={goal.id}
                          onClick={() => handleSelectResult("goals")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all border-none bg-transparent cursor-pointer flex justify-between items-center"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 block truncate">{goal.title}</span>
                            {goal.description && <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{goal.description}</span>}
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">{goal.progress}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Habits Section */}
                {filteredHabits.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-1 pb-1 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Habits</span>
                    </div>
                    <div className="space-y-1">
                      {filteredHabits.map(habit => (
                        <button
                          key={habit.id}
                          onClick={() => handleSelectResult("dashboard")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all border-none bg-transparent cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 truncate flex-1 pr-2">{habit.title}</span>
                          <span className="text-[9px] font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full shrink-0">{habit.streak}d streak</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Focus Sessions Section */}
                {filteredSessions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-1 pb-1 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Focus Logs</span>
                    </div>
                    <div className="space-y-1">
                      {filteredSessions.map(session => (
                        <button
                          key={session.id}
                          onClick={() => handleSelectResult("dashboard")}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all border-none bg-transparent cursor-pointer flex justify-between items-center"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 block truncate">{session.taskTitle || "General Focus Block"}</span>
                            {session.notes && <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{session.notes}</span>}
                          </div>
                          <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full shrink-0">{Math.round(session.durationSeconds / 60)}m</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        
        {/* Toggle AI Assistant */}
        <button
          onClick={onOpenAssistant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-100 dark:border-blue-500/20 cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>AI Assistant</span>
        </button>

        {/* Live Notifications bell with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
                <h5 className="font-bold text-xs text-slate-800 dark:text-white">Workspace Alerts</h5>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              </div>

              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="flex gap-2.5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all">
                    <div className="mt-0.5">
                      {notif.type === "deadline" ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h6 className="font-bold text-xs text-slate-800 dark:text-white truncate">{notif.title}</h6>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{notif.message}</p>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">Your inbox is clear! No active alerts.</p>
                )}
              </div>

              {onMarkNotificationsRead && unreadCount > 0 && (
                <button
                  onClick={() => {
                    onMarkNotificationsRead();
                    setShowNotifications(false);
                  }}
                  className="w-full mt-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[10px] rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                >
                  Mark all as read
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile trigger */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all border-none cursor-pointer ${
            activeTab === "profile" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
            {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : (isAnonymous ? "G" : "?")}
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-2 hidden md:inline">
            {userDisplayName || (isAnonymous ? "Guest" : "User")}
          </span>
        </button>

      </div>
    </header>
  );
}
