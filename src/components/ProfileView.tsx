import React, { useState, FormEvent } from "react";
import { User, Mail, Shield, ShieldCheck, Zap, Sparkles, Award, Star, Trophy, RefreshCw, X } from "lucide-react";
import { auth } from "../firebase";
import { linkWithCredential, EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";

interface ProfileViewProps {
  displayName: string | null;
  userEmail: string | null;
  isAnonymous: boolean;
  totalTasksCompleted: number;
  totalGoalsAccomplished: number;
  focusMinutesTotal: number;
  longestStreak: number;
}

export default function ProfileView({
  displayName,
  userEmail,
  isAnonymous,
  totalTasksCompleted,
  totalGoalsAccomplished,
  focusMinutesTotal,
  longestStreak
}: ProfileViewProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is currently authenticated");

      const credential = EmailAuthProvider.credential(linkEmail, linkPassword);
      await linkWithCredential(user, credential);
      
      setSuccessMsg("Account linked successfully! Your guest data has been associated with your new profile.");
      setShowLinkModal(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to link account credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight text-white">User Profile Hub</h2>
        <p className="text-xs text-slate-400">View your professional badges, sync history, or upgrade guest accounts to permanent cloud storage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card - User Brief */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xs space-y-6 text-center text-white">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-900/25 relative">
              {displayName ? displayName.charAt(0).toUpperCase() : (isAnonymous ? "G" : "?")}
              {isAnonymous && (
                <div className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white p-1 rounded-full border border-slate-900 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm text-slate-100">
              {displayName || (isAnonymous ? "Anonymous Guest" : "TaskPilot User")}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{isAnonymous ? "Guest Sandbox Session" : userEmail}</p>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-left text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Email: {isAnonymous ? "unassigned@taskpilot.ai" : userEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Status: {isAnonymous ? "Temporary Sandbox Account" : "Registered Pilot"}</span>
            </div>
          </div>

          {isAnonymous && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
              <p className="text-[11px] text-amber-400 leading-normal font-sans">
                You are currently on a Guest Session. Your data is temporary unless you establish an account profile.
              </p>
              <button
                onClick={() => setShowLinkModal(true)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/10 cursor-pointer transition-all active:scale-95 border-none"
              >
                Link Guest Account
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl font-sans">
              {successMsg}
            </div>
          )}
        </div>

        {/* Right Columns - Metrics & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-slate-800/50 pb-2">Historic Dashboard Analytics</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-violet-400">{totalTasksCompleted}</span>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Tasks Completed</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-emerald-400">{totalGoalsAccomplished}</span>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Goals Hit</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-amber-400">{focusMinutesTotal}m</span>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Focus Duration</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-rose-400">{longestStreak} Days</span>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Max Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-violet-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-violet-900/40">
            <div className="absolute -bottom-8 -right-8 opacity-10">
              <Trophy className="w-48 h-48 text-violet-600" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-xs font-mono text-violet-300 font-bold uppercase tracking-wider">Pilot Level & Authority</span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-white">Elite Commander Status</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Based on task velocity indices, you possess advanced credentials. Leverage Gemini to decompose complex sprint phases.</p>
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden relative border border-slate-800">
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(15, totalTasksCompleted * 10))}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Level Progress: {totalTasksCompleted} / 10 Completed Sprint Runs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account linking overlay modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 p-6 max-w-md w-full border border-slate-800 shadow-xl rounded-3xl text-white space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Link Guest Account</h3>
              <button onClick={() => setShowLinkModal(false)} className="p-1 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs border border-red-500/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLinkAccount} className="space-y-4">
              <p className="text-xs text-slate-400 leading-normal">Input desired secure email and password to associate this sandbox profile with cloud persistence.</p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-xs"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Secure Password</label>
                <input
                  type="password"
                  required
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-xs"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-900/20 transition-all cursor-pointer border-none"
              >
                {loading ? "Linking..." : "Establish Profile Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
