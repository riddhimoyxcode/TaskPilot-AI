export interface SubTask {
  id: string;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  suggestedOrder?: number;
  rationale?: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: TaskPriority;
  category: string;
  estimatedTime: number; // in minutes
  deadline?: string; // YYYY-MM-DD
  recurring: "none" | "daily" | "weekly" | "monthly";
  isCompleted: boolean;
  attachments?: string[];
  subtasks?: SubTask[];
  userId: string;
  createdAt: string;
  
  // AI prediction fields
  riskLevel?: "Low" | "Medium" | "High" | "Critical";
  riskScore?: number; // 0 to 100 or 0 to 1
  riskExplanation?: string;
  recoveryPlan?: string;
  suggestedOrder?: number;
}

export interface GoalMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0 to 100
  targetDate?: string;
  milestones: GoalMilestone[];
  userId: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekly" | "monthly";
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  history: Record<string, boolean>; // date string key -> completed boolean
  userId: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  startTime: string;
  durationSeconds: number;
  completed: boolean;
  userId: string;
  rating?: number; // 1-5 stars
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "deadline" | "coach" | "achievement" | "reminder";
  isRead: boolean;
  timestamp: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  dailyWorkHours: number;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  soundEnabled: boolean;
  coachingFrequency: "daily" | "weekly" | "none";
  darkMode: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface ScheduleBlock {
  startTime: string;
  endTime: string;
  type: "focus" | "break" | "administrative" | "buffer";
  title: string;
  associatedTaskId?: string;
  description: string;
}

export interface AIPlanResult {
  scheduleBlocks: ScheduleBlock[];
  estimatedCompletionRate: number;
  coachInsight: string;
}
