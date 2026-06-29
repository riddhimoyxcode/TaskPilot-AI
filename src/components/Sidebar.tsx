import { 
  LayoutDashboard, 
  CheckSquare, 
  Sparkles, 
  Target, 
  BarChart2, 
  Settings, 
  User, 
  LogOut, 
  Plane,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import taskpilotLogo from "../assets/images/taskpilot_logo_1782659141564.jpg";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userEmail, 
  displayName, 
  isAnonymous, 
  onLogout 
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "planner", label: "AI Planner", icon: Sparkles },
    { id: "goals", label: "Goals", icon: Target },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden bg-white dark:bg-[#090a0f] text-slate-900 dark:text-white flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-slate-200/50 dark:border-slate-800">
            <img 
              src={taskpilotLogo} 
              alt="TaskPilot Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-sm tracking-tight font-sans text-slate-900 dark:text-white">TaskPilot<span className="text-blue-600 dark:text-blue-400">AI</span></span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border-none cursor-pointer text-slate-500 dark:text-slate-400"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-20 transition-all"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-60 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col justify-between p-6 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none md:pointer-events-auto md:flex"}
      `}>
        <div className="flex flex-col gap-6">
          {/* Logo brand */}
          <div className="hidden md:flex items-center gap-3 px-1 py-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800">
              <img 
                src={taskpilotLogo} 
                alt="TaskPilot Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight font-sans leading-none text-slate-900 dark:text-white">TaskPilot<span className="text-blue-600 dark:text-blue-400">AI</span></h1>
              <span className="text-[9px] font-mono uppercase text-blue-600 dark:text-blue-400 tracking-widest mt-1 block font-bold">AI CO-PILOT HUB</span>
            </div>
          </div>

          {/* User profile brief */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {displayName ? displayName.charAt(0).toUpperCase() : (isAnonymous ? "G" : "?")}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-xs text-slate-800 dark:text-white truncate">
                {displayName || (isAnonymous ? "Anonymous Guest" : "TaskPilot User")}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isAnonymous ? "Sandbox Mode" : userEmail}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer group rounded-xl border-none
                    ${isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`} />
                  {item.label}
                  {item.id === "planner" && (
                    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? "bg-blue-800 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                      GenAI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer group border-none"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 text-rose-500" />
            Sign Out
          </button>
          <div className="text-center mt-2">
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600 font-semibold block">v2.0.0 • TASKPILOT AI</span>
          </div>
        </div>
      </aside>
    </>
  );
}
