import { useState, useEffect } from "react";
import { Settings, Volume2, VolumeX, Clock, Monitor, Save, Sun, Moon } from "lucide-react";
import { UserSettings } from "../types";

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
}

export default function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  const [workMin, setWorkMin] = useState(settings.pomodoroWorkMinutes);
  const [breakMin, setBreakMin] = useState(settings.pomodoroBreakMinutes);
  const [dailyHours, setDailyHours] = useState(settings.dailyWorkHours);
  const [sound, setSound] = useState(settings.soundEnabled);
  const [coaching, setCoaching] = useState(settings.coachingFrequency);
  const [darkMode, setDarkMode] = useState(settings.darkMode);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWorkMin(settings.pomodoroWorkMinutes);
    setBreakMin(settings.pomodoroBreakMinutes);
    setDailyHours(settings.dailyWorkHours);
    setSound(settings.soundEnabled);
    setCoaching(settings.coachingFrequency);
    setDarkMode(settings.darkMode);
  }, [
    settings.pomodoroWorkMinutes,
    settings.pomodoroBreakMinutes,
    settings.dailyWorkHours,
    settings.soundEnabled,
    settings.coachingFrequency,
    settings.darkMode
  ]);

  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSave = () => {
    onUpdateSettings({
      pomodoroWorkMinutes: Number(workMin),
      pomodoroBreakMinutes: Number(breakMin),
      dailyWorkHours: Number(dailyHours),
      soundEnabled: sound,
      coachingFrequency: coaching,
      darkMode
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">TaskPilot Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure Pomodoro pacing limits, notification chimes, and coaching intervals.</p>
      </div>

      <div className="max-w-4xl">
        
        {/* Settings Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-6 text-slate-800 dark:text-white transition-all">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Engine Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            {/* Work minutes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Pomodoro Work Interval (min)
              </label>
              <input
                type="number"
                value={workMin}
                onChange={(e) => setWorkMin(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs"
                min={5}
                max={120}
              />
            </div>

            {/* Break minutes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Pomodoro Rest Interval (min)
              </label>
              <input
                type="number"
                value={breakMin}
                onChange={(e) => setBreakMin(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs"
                min={1}
                max={60}
              />
            </div>

            {/* Daily Hours Target */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Daily Work Capacity (hours)
              </label>
              <input
                type="number"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs"
                min={1}
                max={18}
              />
            </div>

            {/* Sound Toggles */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {sound ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                Chime Sounds
              </span>
              <button
                onClick={() => setSound(!sound)}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                  sound ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-800"
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  sound ? "left-6" : "left-1"
                }`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            {/* Coaching frequency */}
            <div>
              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-2">AI Coaching Frequency</label>
              <select
                value={coaching}
                onChange={(e) => setCoaching(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs"
              >
                <option value="daily" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Daily Intensive</option>
                <option value="weekly" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Weekly Checklist Strategy</option>
                <option value="none" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Deactivated</option>
              </select>
            </div>
 
            {/* Theme Preference Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Appearance Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange(false)}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !darkMode
                      ? "bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-800"
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange(true)}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    darkMode
                      ? "bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-800"
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-500 dark:text-blue-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
            {saved && (
              <span className="text-xs text-emerald-500 dark:text-emerald-400 font-sans font-bold animate-pulse">
                ✓ Parameters synced successfully
              </span>
            )}
            <button
              onClick={handleSave}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer border-none"
            >
              <Save className="w-4 h-4 text-white" /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
