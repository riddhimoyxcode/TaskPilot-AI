import React, { useState, FormEvent } from "react";
import { auth, googleProvider } from "../firebase";
import { 
  signInWithPopup, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { Plane, LogIn, Sparkles, AlertCircle } from "lucide-react";
import taskpilotLogo from "../assets/images/taskpilot_logo_1782659141564.jpg";

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error("Display name is required");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInAnonymously(auth);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Guest sandbox access failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden rounded-3xl">
        
        {/* Header branding */}
        <div className="bg-slate-950/40 px-6 py-8 text-center text-white border-b border-slate-800 relative">
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> AI Active
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg mb-4">
            <img 
              src={taskpilotLogo} 
              alt="TaskPilot Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">TaskPilot AI</h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
            Your intelligent productivity companion. Optimize, schedule, and conquer your day.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs flex items-start gap-3 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-xs placeholder:text-slate-500"
                  placeholder="Alex Mercer"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-xs placeholder:text-slate-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-xs placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-900/20 transition-all cursor-pointer disabled:opacity-50 border-none"
            >
              <LogIn className="w-4 h-4 text-white" />
              {loading ? "Processing..." : isSignUp ? "Create Pilot Account" : "Sign In to TaskPilot"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-violet-400 hover:underline font-semibold cursor-pointer bg-transparent border-none"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-slate-900 px-3 text-slate-500 font-sans tracking-wider">Or Connect Instantly</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-white font-semibold text-xs cursor-pointer rounded-xl"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.01.76 12 .76c-4.64 0-8.58 2.67-10.45 6.57l3.86 3c.92-2.76 3.49-4.8 6.59-4.8z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.41 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.86-3C.56 8.78 0 10.33 0 12s.56 3.22 1.55 5.12l3.86-3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.24c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.3 1.09-3.72 1.09-3.1 0-5.67-2.04-6.59-4.8l-3.86 3c1.87 3.9 5.81 6.57 10.45 6.57z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleGuestSignIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-white font-semibold text-xs cursor-pointer rounded-xl"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              Guest Sandbox
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              *Guest Sandbox activates an anonymous session synced via secure cloud firestore rules. Upgrade to Google profile at any point.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
