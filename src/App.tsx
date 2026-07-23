import { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType, cleanFirestorePayload } from "./firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs
} from "firebase/firestore";

import { Task, Goal, Habit, FocusSession, Notification, UserSettings } from "./types";

import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import TasksView from "./components/TasksView";
import PlannerView from "./components/PlannerView";
import GoalsView from "./components/GoalsView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import ProfileView from "./components/ProfileView";
import TopBar from "./components/TopBar";
import FloatingAssistant from "./components/FloatingAssistant";

import { 
  Plane, 
  AlertTriangle, 
  RefreshCw,
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  Target,
  BarChart2,
  Settings,
  User
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Subscribed states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const [aiPrioritizing, setAiPrioritizing] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [autoOpenTaskForm, setAutoOpenTaskForm] = useState(false);

  // Sync dark class on document element
  useEffect(() => {
    const isDark = settings?.darkMode ?? false;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.darkMode]);

  const handleMarkNotificationsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      for (const notif of unread) {
        await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
      }
    } catch (e) {
      console.error("Failed to update notifications", e);
    }
  };

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // Sync state with Firestore once authenticated
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;

    // Subscriptions
    const tasksQuery = query(collection(db, "tasks"), where("userId", "==", uid));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snap) => {
      const list: Task[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "tasks");
    });

    const goalsQuery = query(collection(db, "goals"), where("userId", "==", uid));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snap) => {
      const list: Goal[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "goals");
    });

    const habitsQuery = query(collection(db, "habits"), where("userId", "==", uid));
    const unsubscribeHabits = onSnapshot(habitsQuery, (snap) => {
      const list: Habit[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Habit);
      });
      setHabits(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "habits");
    });

    const sessionsQuery = query(collection(db, "sessions"), where("userId", "==", uid));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snap) => {
      const list: FocusSession[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as FocusSession);
      });
      setSessions(list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "sessions");
    });

    const notificationsQuery = query(collection(db, "notifications"), where("userId", "==", uid));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snap) => {
      const list: Notification[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "notifications");
    });

    const settingsQuery = query(collection(db, "settings"), where("userId", "==", uid));
    const unsubscribeSettings = onSnapshot(settingsQuery, (snap) => {
      if (!snap.empty) {
        const first = snap.docs[0];
        setSettings({ id: first.id, ...first.data() } as UserSettings);
      } else {
        // Create initial default settings document
        const initialSettings: Omit<UserSettings, "id"> = {
          userId: uid,
          dailyWorkHours: 8,
          pomodoroWorkMinutes: 25,
          pomodoroBreakMinutes: 5,
          soundEnabled: true,
          coachingFrequency: "daily",
          darkMode: false
        };
        addDoc(collection(db, "settings"), initialSettings).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, "settings");
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "settings");
    });

    // Check if initial seed is needed (First Time User Experience)
    checkAndSeedInitialData(uid);

    return () => {
      unsubscribeTasks();
      unsubscribeGoals();
      unsubscribeHabits();
      unsubscribeSessions();
      unsubscribeNotifications();
      unsubscribeSettings();
    };
  }, [currentUser]);

  // Seeding mockup data on first-time login
  const checkAndSeedInitialData = async (uid: string) => {
    // No-op to support completely empty workspace for first-time users
  };

  // Auth logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTasks([]);
      setGoals([]);
      setHabits([]);
      setSessions([]);
      setNotifications([]);
      setSettings(null);
      setActiveTab("dashboard");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // CRUD Task operations
  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, "tasks"), cleanFirestorePayload({
        ...taskData,
        isCompleted: false,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      }));
    } catch (err: any) {
      setGeneralError("Failed to add task: " + err.message);
      handleFirestoreError(err, OperationType.CREATE, "tasks");
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskDoc = doc(db, "tasks", taskId);
      await updateDoc(taskDoc, cleanFirestorePayload(updates));
    } catch (err: any) {
      setGeneralError("Failed to update task: " + err.message);
      handleFirestoreError(err, OperationType.UPDATE, "tasks/" + taskId);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const taskDoc = doc(db, "tasks", taskId);
      await deleteDoc(taskDoc);
    } catch (err: any) {
      setGeneralError("Failed to delete task: " + err.message);
      handleFirestoreError(err, OperationType.DELETE, "tasks/" + taskId);
    }
  };

  // CRUD Goal operations
  const handleAddGoal = async (goalData: Partial<Goal>) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, "goals"), cleanFirestorePayload({
        ...goalData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      }));
    } catch (err: any) {
      setGeneralError("Failed to add goal: " + err.message);
      handleFirestoreError(err, OperationType.CREATE, "goals");
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const goalDoc = doc(db, "goals", goalId);
      await updateDoc(goalDoc, cleanFirestorePayload(updates));
    } catch (err: any) {
      setGeneralError("Failed to update goal: " + err.message);
      handleFirestoreError(err, OperationType.UPDATE, "goals/" + goalId);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const goalDoc = doc(db, "goals", goalId);
      await deleteDoc(goalDoc);
    } catch (err: any) {
      setGeneralError("Failed to delete goal: " + err.message);
      handleFirestoreError(err, OperationType.DELETE, "goals/" + goalId);
    }
  };

  // Settings update
  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    if (!settings) return;
    try {
      const settingsDoc = doc(db, "settings", settings.id);
      await updateDoc(settingsDoc, cleanFirestorePayload(updates));
    } catch (err: any) {
      setGeneralError("Failed to update settings: " + err.message);
      handleFirestoreError(err, OperationType.UPDATE, "settings/" + settings.id);
    }
  };

  // AI Task Prioritizer action
  const handlePrioritizeTasksAI = async () => {
    if (tasks.length === 0) return;
    setAiPrioritizing(true);
    try {
      const uncompletedTasks = tasks.filter((t) => !t.isCompleted);
      const res = await fetch("/api/gemini/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: uncompletedTasks,
          completionHistory: sessions.slice(0, 10)
        })
      });

      const data = await res.json();
      
      // Update each task's priority metadata based on AI payload response
      for (const item of data.prioritizedTasks) {
        const matched = uncompletedTasks.find((t) => t.id === item.taskId);
        if (matched) {
          try {
            await updateDoc(doc(db, "tasks", matched.id), {
              suggestedOrder: item.suggestedOrder,
              riskScore: Math.round(item.riskScore * 100),
              riskLevel: item.riskLabel,
              riskExplanation: item.reasoning
            });
          } catch (err: any) {
            handleFirestoreError(err, OperationType.UPDATE, "tasks/" + matched.id);
          }
        }
      }

      // Add a smart co-pilot notification
      await addDoc(collection(db, "notifications"), {
        userId: currentUser?.uid,
        title: "AI Priorities Mapped",
        message: data.overallStrategy,
        type: "coach",
        isRead: false,
        timestamp: new Date().toISOString()
      });

      // Navigate immediately to tasks view so they see the result!
      setActiveTab("tasks");
    } catch (err) {
      console.error("AI prioritizer error:", err);
    } finally {
      setAiPrioritizing(false);
    }
  };

  // Log focus session callback
  const handleSessionLogged = (newSession: FocusSession) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-600 rounded-xl animate-bounce shadow-lg shadow-violet-900/35">
          <Plane className="w-6 h-6 text-white transform -rotate-45" />
        </div>
        <p className="text-xs font-mono text-slate-400 animate-pulse uppercase tracking-wider">Syncing TaskPilot workspace...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  // Active Tab Rendering
  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            tasks={tasks}
            goals={goals}
            habits={habits}
            sessions={sessions}
            notifications={notifications}
            onAddTask={handleAddTask}
            userId={currentUser.uid}
            onSessionLogged={handleSessionLogged}
            onRefreshStats={() => setGeneralError("")}
            onNavigateToTasks={() => {
              setAutoOpenTaskForm(true);
              setActiveTab("tasks");
            }}
          />
        );
      case "tasks":
        return (
          <TasksView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onPrioritizeTasksAI={handlePrioritizeTasksAI}
            aiPrioritizing={aiPrioritizing}
            autoOpenAddForm={autoOpenTaskForm}
            onResetAutoOpen={() => setAutoOpenTaskForm(false)}
          />
        );
      case "planner":
        return <PlannerView tasks={tasks} />;
      case "goals":
        return (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            tasks={tasks}
            goals={goals}
            sessions={sessions}
            habits={habits}
          />
        );
      case "settings":
        return (
          <SettingsView
            settings={settings || {
              id: "",
              userId: currentUser.uid,
              dailyWorkHours: 8,
              pomodoroWorkMinutes: 25,
              pomodoroBreakMinutes: 5,
              soundEnabled: true,
              coachingFrequency: "daily",
              darkMode: false
            }}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case "profile":
        return (
          <ProfileView
            displayName={currentUser.displayName}
            userEmail={currentUser.email}
            isAnonymous={currentUser.isAnonymous}
            totalTasksCompleted={tasks.filter(t => t.isCompleted).length}
            totalGoalsAccomplished={goals.filter(g => g.progress === 100).length}
            focusMinutesTotal={sessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0)}
            longestStreak={habits.reduce((max, h) => Math.max(max, h.streak), 0)}
          />
        );
      default:
        return <div>View not implemented</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-800 dark:text-slate-100 antialiased font-sans flex flex-col md:flex-row transition-colors duration-300 pb-16 md:pb-0 grid-bg-light">
      
      {/* Dynamic Error alert popup */}
      {generalError && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-50 dark:bg-red-950/85 border-l-4 border-red-500 rounded-r-xl shadow-lg flex items-center gap-3 max-w-sm animate-in slide-in-from-bottom duration-300 backdrop-blur-xs">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="text-xs text-red-800 dark:text-red-200 font-medium leading-normal">{generalError}</div>
          <button onClick={() => setGeneralError("")} className="text-slate-400 hover:text-slate-200 font-bold ml-auto text-xs pl-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Main Sidebar (visible on desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={currentUser.email}
        displayName={currentUser.displayName}
        isAnonymous={currentUser.isAnonymous}
        onLogout={handleLogout}
      />

      {/* Primary Page Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-20 md:pb-8">
        
        {/* Modern Top Bar with Search, Alerts, Profile and AI Assistant */}
        <TopBar
          notifications={notifications}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userDisplayName={currentUser?.displayName || null}
          isAnonymous={currentUser?.isAnonymous ?? false}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          tasks={tasks}
          goals={goals}
          habits={habits}
          sessions={sessions}
        />

        {renderView()}
      </main>

      {/* Floating AI Assistant */}
      <FloatingAssistant
        tasks={tasks}
        goals={goals}
        habits={habits}
        sessions={sessions}
        isOpen={isAssistantOpen}
        setIsOpen={setIsAssistantOpen}
        onPrioritizeAI={handlePrioritizeTasksAI}
        onOpenCoaching={() => {
          setActiveTab("dashboard");
          setIsAssistantOpen(false);
          setTimeout(() => {
            const el = document.getElementById("ai-coaching-brief-card");
            el?.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-1.5 py-1 flex justify-around items-center shadow-lg transition-colors duration-300">
        {[
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "tasks", label: "Tasks", icon: CheckSquare },
          { id: "planner", label: "Planner", icon: Sparkles },
          { id: "goals", label: "Goals", icon: Target },
          { id: "analytics", label: "Analytics", icon: BarChart2 },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition-all cursor-pointer border-none bg-transparent ${
                isActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <IconComponent className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-tight font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
