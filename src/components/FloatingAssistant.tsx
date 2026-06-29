import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Brain, Bot, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Task, Goal, Habit, FocusSession } from "../types";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface FloatingAssistantProps {
  tasks: Task[];
  goals?: Goal[];
  habits?: Habit[];
  sessions?: FocusSession[];
  onPrioritizeAI: () => void;
  onOpenCoaching: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function FloatingAssistant({ 
  tasks, 
  goals = [],
  habits = [],
  sessions = [],
  onPrioritizeAI, 
  onOpenCoaching,
  isOpen,
  setIsOpen
}: FloatingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your TaskPilot AI Assistant. 🚀\nHow can I help you optimize your focus, time block your schedule, or audit your habits today? Feel free to ask me general productivity questions, coding exercises, science, mathematics, career guidance, or just have a chat!",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) {
      setInputText("");
    }

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    // Update frontend state immediately with user message
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map history payload
      const historyPayload = messages.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: {
            totalTasks: tasks.length,
            pendingTasks: tasks.filter(t => !t.isCompleted).map(t => ({
              title: t.title,
              priority: t.priority,
              deadline: t.deadline || "No deadline",
            })),
            completedTasks: tasks.filter(t => t.isCompleted).map(t => t.title),
            goals: goals.map(g => ({
              title: g.title,
              description: g.description,
              targetDate: g.targetDate || "No target date",
              progress: g.progress || 0,
              milestonesCount: g.milestones?.length || 0,
            })),
            habits: habits.map(h => ({
              title: h.title,
              frequency: h.frequency,
              streak: h.streak || 0,
            })),
            recentFocusSessions: sessions.slice(-5).map(s => ({
              taskTitle: s.taskTitle || "General session",
              durationSeconds: s.durationSeconds,
              completed: s.completed,
              startTime: s.startTime
            }))
          }
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || "I am processing your workspace details. Feel free to ask anything else about your schedule!";

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: aiReply,
          timestamp: new Date(),
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: "I experienced a minor latency blip syncing with the Gemini server. Please check your internet connection or try again shortly!",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-tr from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 cursor-pointer transition-all hover:scale-105 active:scale-95 border-none focus:outline-none animate-bounce"
        style={{ animationDuration: "3s" }}
        title="Ask TaskPilot AI Co-Pilot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 left-4 sm:right-6 sm:left-auto w-auto sm:w-96 h-[420px] sm:h-[500px] max-h-[60vh] sm:max-h-none z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs tracking-wide">TASKPILOT AI</h4>
                <p className="text-[10px] text-blue-100 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Direct Co-Pilot Sync
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white border-none cursor-pointer bg-transparent transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800/80 px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setIsOpen(false);
                onPrioritizeAI();
              }}
              className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shrink-0 transition-all"
            >
              🎯 Optimize Priorities
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCoaching();
              }}
              className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shrink-0 transition-all"
            >
              ⚡ Get Coaching Advice
            </button>
            <button
              onClick={() => selectQuickPrompt("Tell me a quick motivational quote for work")}
              className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shrink-0 transition-all"
            >
              🔥 Motivate Me
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-900/10"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs"
                  }`}
                >
                  <div className="markdown-body">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xs font-bold mt-2 mb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xs font-bold mt-1.5 mb-1" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-[11px] font-bold mt-1 mb-0.5" {...props} />,
                        p: ({node, ...props}) => <p className="mb-1.5 last:mb-0 leading-relaxed whitespace-pre-wrap" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5" {...props} />,
                        li: ({node, ...props}) => <li className="text-xs" {...props} />,
                        code: ({node, children, ...props}) => (
                          <code className="bg-slate-100 dark:bg-slate-900 text-red-600 dark:text-red-400 px-1 py-0.5 rounded font-mono text-[10px]" {...props}>
                            {children}
                          </code>
                        ),
                        pre: ({node, ...props}) => <pre className="bg-slate-100 dark:bg-slate-950 p-2 rounded-lg my-1.5 overflow-x-auto text-[10px] font-mono border border-slate-200 dark:border-slate-800" {...props} />,
                        table: ({node, ...props}) => <table className="min-w-full border-collapse border border-slate-200 dark:border-slate-800 my-2 text-[10px]" {...props} />,
                        th: ({node, ...props}) => <th className="border border-slate-200 dark:border-slate-800 px-2 py-1 bg-slate-50 dark:bg-slate-950 font-bold" {...props} />,
                        td: ({node, ...props}) => <td className="border border-slate-200 dark:border-slate-800 px-2 py-1" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 underline hover:text-blue-500" target="_blank" rel="noopener noreferrer" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  <span
                    className={`text-[8px] mt-1 block text-right ${
                      msg.sender === "user" ? "text-blue-200" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>AI Co-Pilot is writing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything... (e.g. How to stop slacking?)"
              className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 rounded-xl flex items-center justify-center shrink-0 cursor-pointer border-none transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
