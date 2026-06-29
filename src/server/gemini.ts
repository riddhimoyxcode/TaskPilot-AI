import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialize Gemini API client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will fallback to mock responses.");
      throw new Error("GEMINI_API_KEY is required for AI features");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instructions for TaskPilot AI
const BASE_SYSTEM_INSTRUCTION = `You are TaskPilot AI, an elite productivity companion, product coach, and life strategist. 
Your goal is to help users manage their workload, overcome procrastination, predict and mitigate missed deadlines, and maintain focus.
CRITICAL: Never return simple lists. Always provide deep, empathetic, and actionable explanations for WHY you made a recommendation. 
Use markdown formatting beautifully.`;

/**
 * AI Task Prioritizer
 */
export async function aiPrioritizeTasks(tasks: any[], completionHistory: any[]) {
  try {
    const ai = getAiClient();
    const prompt = `
Analyze the following list of tasks and the user's past completion history to generate an optimal priority order, along with explanations and completion risk estimates.

TASKS TO PRIORITIZE:
${JSON.stringify(tasks, null, 2)}

PAST USER HISTORY / WORK STYLE:
${JSON.stringify(completionHistory, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prioritizedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  suggestedOrder: { type: Type.INTEGER },
                  riskScore: { type: Type.NUMBER },
                  riskLabel: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["taskId", "suggestedOrder", "riskScore", "riskLabel", "reasoning"]
              }
            },
            overallStrategy: { type: Type.STRING }
          },
          required: ["prioritizedTasks", "overallStrategy"]
        },
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini API");
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.warn("aiPrioritizeTasks rate-limited or unavailable. Activating graceful local fallback.");
    return fallbackPrioritizeTasks(tasks);
  }
}

/**
 * AI Planner - Time block scheduler
 */
export async function aiGenerateSchedule(availableHours: number, tasks: any[], preferences: any) {
  try {
    const ai = getAiClient();
    const prompt = `
Generate a highly detailed, realistic, and productive time-blocked schedule for a ${availableHours}-hour work period, incorporating the following tasks, standard focus cycles (e.g., Pomodoro), and regular wellness breaks.

TASKS TO SCHEDULE:
${JSON.stringify(tasks, null, 2)}

USER PREFERENCES:
${JSON.stringify(preferences, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scheduleBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  associatedTaskId: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["startTime", "endTime", "type", "title", "description"]
              }
            },
            estimatedCompletionRate: { type: Type.INTEGER },
            coachInsight: { type: Type.STRING }
          },
          required: ["scheduleBlocks", "estimatedCompletionRate", "coachInsight"]
        },
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini API");
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.warn("aiGenerateSchedule rate-limited or unavailable. Activating graceful local fallback.");
    return fallbackGenerateSchedule(availableHours, tasks);
  }
}

/**
 * AI Task Breakdown
 */
export async function aiBreakdownTask(taskName: string, taskDescription: string, estimatedMinutes: number) {
  try {
    const ai = getAiClient();
    const prompt = `
Deconstruct the following large task into atomic, manageable subtasks (milestones), assigning estimates and sequencing order so the user overcomes friction.

PARENT TASK:
Name: ${taskName}
Description: ${taskDescription}
Total Estimated Time: ${estimatedMinutes} minutes
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  suggestedOrder: { type: Type.INTEGER },
                  rationale: { type: Type.STRING }
                },
                required: ["title", "durationMinutes", "suggestedOrder", "rationale"]
              }
            },
            coachingTip: { type: Type.STRING }
          },
          required: ["subtasks", "coachingTip"]
        },
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini API");
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.warn("aiBreakdownTask rate-limited or unavailable. Activating graceful local fallback.");
    return fallbackBreakdownTask(taskName, estimatedMinutes);
  }
}

/**
 * AI Productivity Coach advice & burnout detection
 */
export async function aiGetCoachingAdvice(userStats: any, tasks: any[], habits: any[]) {
  try {
    const ai = getAiClient();
    const prompt = `
Analyze the user's productivity state, habit adherence, and pending task burden.
Detect signs of potential burnout (e.g., high count of overdue tasks, long streaks with high density, or flatlined habits) and provide compassionate, strategic advice.

USER STATS:
${JSON.stringify(userStats, null, 2)}

PENDING TASKS:
${JSON.stringify(tasks, null, 2)}

CURRENT HABITS:
${JSON.stringify(habits, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            burnoutRisk: { type: Type.STRING },
            burnoutAnalysis: { type: Type.STRING },
            dailyAdvice: { type: Type.STRING },
            weeklyStrategy: { type: Type.STRING },
            motivationalQuote: { type: Type.STRING },
            tacticalSprints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "description"]
              }
            }
          },
          required: [
            "burnoutRisk",
            "burnoutAnalysis",
            "dailyAdvice",
            "weeklyStrategy",
            "motivationalQuote",
            "tacticalSprints"
          ]
        },
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini API");
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.warn("aiGetCoachingAdvice rate-limited or unavailable. Activating graceful local fallback.");
    return fallbackGetCoachingAdvice();
  }
}

/**
 * AI Deadline Predictor & Recovery Plan
 */
export async function aiPredictDeadlineRisk(task: any, recentVelocity: any) {
  try {
    const ai = getAiClient();
    const prompt = `
Perform a high-precision risk assessment on the following upcoming task deadline, factoring in the user's recent completion velocity.

TASK DETAIL:
${JSON.stringify(task, null, 2)}

RECENT VELOCITY (Tasks completed per day / average delay):
${JSON.stringify(recentVelocity, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            probabilityPercentage: { type: Type.INTEGER },
            urgencyScore: { type: Type.INTEGER },
            suggestedNewCompletionDate: { type: Type.STRING },
            riskExplanation: { type: Type.STRING },
            recoveryPlan: { type: Type.STRING }
          },
          required: [
            "riskLevel",
            "probabilityPercentage",
            "urgencyScore",
            "suggestedNewCompletionDate",
            "riskExplanation",
            "recoveryPlan"
          ]
        },
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini API");
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.warn("aiPredictDeadlineRisk rate-limited or unavailable. Activating graceful local fallback.");
    return fallbackPredictDeadlineRisk(task);
  }
}

/**
 * AI Conversational Chat Assistant System Instruction
 */
const CHAT_SYSTEM_INSTRUCTION = `You are TaskPilot AI, an elite, highly intelligent conversational AI assistant (similar to Gemini or ChatGPT) and personal productivity companion.

Core Guidelines & Capabilities:
1. Support a wide range of inquiries including general knowledge, science, programming/coding, mathematics, technology, career guidance, study help, interview preparation, creative brainstorming, writing/editing assistance, startup/business ideas, time management, physical/mental wellness (non-medical), and everyday lighthearted conversation.
2. NEVER refuse harmless queries. If the user's question is unrelated to productivity or the workspace (e.g. general science, coding, creative brainstorming, math, general Q&A), answer it directly, accurately, and natural conversational style. Do NOT deflect or refuse.
3. When the user asks about their tasks, deadlines, goals, habits, focus sessions, or productivity analytics, integrate the supplied WORKSPACE CONTEXT perfectly to deliver highly personalized, strategic, and accurate feedback.
4. Politely refuse only dangerous, illegal, or harmful requests.

Response Quality & Formatting:
- Provide rich, detailed, detailed, helpful, and highly accurate explanations. Do not unnecessarily shorten or truncate responses.
- Explain your step-by-step reasoning or provide structured frameworks when appropriate.
- Format responses elegantly using markdown. Leverage headings, bullet points, numbered lists, tables, and bold formatting to enhance visual scannability and structure.`;

/**
 * AI Conversational Chat Assistant
 */
export async function aiChatAssistant(
  message: string,
  context: any,
  history: { role: string; text: string }[] = []
) {
  try {
    const ai = getAiClient();

    // Prepare context block
    let contextBlock = "WORKSPACE CONTEXT:\n";
    if (context) {
      contextBlock += `- Total Tasks in list: ${context.totalTasks || 0}\n`;
      if (context.pendingTasks && context.pendingTasks.length > 0) {
        contextBlock += `- Pending Tasks: ${JSON.stringify(context.pendingTasks)}\n`;
      }
      if (context.completedTasks && context.completedTasks.length > 0) {
        contextBlock += `- Completed Tasks: ${JSON.stringify(context.completedTasks)}\n`;
      }
      if (context.goals && context.goals.length > 0) {
        contextBlock += `- Strategic Goals: ${JSON.stringify(context.goals)}\n`;
      }
      if (context.habits && context.habits.length > 0) {
        contextBlock += `- Habits tracked: ${JSON.stringify(context.habits)}\n`;
      }
      if (context.recentFocusSessions && context.recentFocusSessions.length > 0) {
        contextBlock += `- Recent Focus Sessions: ${JSON.stringify(context.recentFocusSessions)}\n`;
      }
    } else {
      contextBlock += "- No active workspace context supplied.\n";
    }

    // Construct multi-turn contents array
    const contents: any[] = [];

    // Map history to the correct role format for @google/genai SDK
    if (history && history.length > 0) {
      history.forEach((h) => {
        contents.push({
          role: h.role === "ai" || h.role === "model" ? "model" : "user",
          parts: [{ text: h.text }],
        });
      });
    }

    // Append the current turn user message with workspace context block prepended so the model knows the state
    const currentMessageText = `${contextBlock}\n\nUSER INPUT: ${message}`;
    contents.push({
      role: "user",
      parts: [{ text: currentMessageText }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini API");
    return { reply: text.trim() };
  } catch (error: any) {
    console.error("aiChatAssistant Gemini API error (activating smart adaptive fallback):", error);
    return { 
      reply: getSmartFallbackReply(message, context) 
    };
  }
}

/**
 * Intelligent, context-aware rule-based fallback assistant when Gemini API is rate-limited or unavailable
 */
function getSmartFallbackReply(message: string, context: any): string {
  const msgLower = message.toLowerCase();
  const pending = context?.pendingTasks || [];
  
  let taskMention = "";
  if (pending.length > 0) {
    const listStr = pending.slice(0, 3).map((t: string) => `• **${t}**`).join("\n");
    taskMention = `\n\nI noticed you have **${pending.length}** pending task${pending.length > 1 ? "s" : ""} in your list, such as:\n${listStr}\n\n`;
  } else {
    taskMention = `\n\nI see your workspace is completely clear of pending tasks right now. That is a great opportunity to plan your next major milestones!\n\n`;
  }

  // 1. Procrastination / Slacking / Lazy
  if (
    msgLower.includes("procrastinate") || 
    msgLower.includes("procrastination") || 
    msgLower.includes("lazy") || 
    msgLower.includes("slack") || 
    msgLower.includes("slacking") ||
    msgLower.includes("start") ||
    msgLower.includes("begin") ||
    msgLower.includes("motivation") ||
    msgLower.includes("motivate")
  ) {
    return `### Overcoming Resistance & Procrastination 🚀

It sounds like you're facing some friction starting today. That is completely normal—procrastination is usually an emotional response to feeling overwhelmed or bored, not a lack of discipline!

Here is your immediate Action Plan:
1. **The 5-Minute Rule**: Tell yourself you will only work on a task for exactly 5 minutes. If you want to stop after 5 minutes, you can. 90% of the time, the friction disappears once momentum begins.
2. **Atomic Steps**: Break your task down until it is ridiculously small. Instead of "Write research paper", your first step should be "Open Google Docs and write one sentence."
3. **Clear Distractions**: Close all browser tabs that aren't related to your primary task, put your phone in another room, and clear your desk.
${taskMention}Let's take a look at your pending list. Pick the smallest, easiest task first (the "low-hanging fruit") to build immediate confidence and activate your flow state!`;
  }

  // 2. Focus / Distracted / Concentration
  if (
    msgLower.includes("focus") || 
    msgLower.includes("distract") || 
    msgLower.includes("distracted") || 
    msgLower.includes("attention") || 
    msgLower.includes("concentrate") ||
    msgLower.includes("concentration")
  ) {
    return `### Locking in Your Focus 🎯

Distractions are the greatest enemy of deep progress. To reclaim your attention span and enter a flow state, try this systematic setup:

1. **Implement Pomodoro Cycles**: Work with absolute focus for 25 minutes, then take a mandatory 5-minute break. Repeat this 4 times, then take a longer 15-30 minute break.
2. **The "External Brain" Technique**: If an unrelated thought pops into your head while working (e.g. "I need to buy milk"), write it down on a physical piece of paper and immediately return to your task. This clears your cognitive load.
3. **Visual Triggers**: Put on headphones with instrumental music (lo-fi, synthwave, or classical) to signal to your brain that it is deep-focus time.
${taskMention}For your next session, select one task, set a 25-minute timer, and do not switch tasks under any circumstances until the timer rings. You've got this!`;
  }

  // 3. Burnout / Overwhelmed / Tired / Stressed / Exhausted
  if (
    msgLower.includes("burnout") || 
    msgLower.includes("tired") || 
    msgLower.includes("stressed") || 
    msgLower.includes("overwhelmed") || 
    msgLower.includes("exhausted") || 
    msgLower.includes("fatigue") ||
    msgLower.includes("sad") ||
    msgLower.includes("depressed")
  ) {
    return `### Strategic Recharge & Stress Mitigation 🌸

It sounds like you are carrying a heavy cognitive load right now, and I want to acknowledge how challenging that can be. Burnout and feeling overwhelmed are signs that your output has exceeded your recovery for too long.

Here is how we can navigate this together:
1. **The 'Highlight of the Day'**: Pick exactly **one** critical task from your list. Everything else is a bonus. Give yourself permission to let secondary items slide.
2. **Defensive Scheduling**: Dedicate the next 15-30 minutes to absolute non-production. Walk outside, do light stretching, drink a cold glass of water, or sit quietly. No screens allowed.
3. **Aggressive Scope Reduction**: Look at your tasks and see what can be delayed, automated, or deleted. 
${taskMention}Remember, sustainable productivity is a marathon, not a sprint. Be kind to yourself today, lower your expectations for a bit, and focus only on what is essential. Your mental well-being is the foundation of all your achievements!`;
  }

  // 4. Time Blocking / Schedule / Planner / Hours / Calendar
  if (
    msgLower.includes("schedule") || 
    msgLower.includes("time") || 
    msgLower.includes("planner") || 
    msgLower.includes("time block") || 
    msgLower.includes("block") ||
    msgLower.includes("hours") ||
    msgLower.includes("calendar")
  ) {
    return `### Constructing a High-Leverage Schedule 📅

Time-blocking is the gold standard of productivity because it turns abstract desires into concrete commitments. 

Here is how to design your day:
1. **Match Your Chronotype**: Put your most intense, high-focus tasks during your peak energy hours (typically mid-morning). Save administrative/shallow tasks (emails, cleaning, scheduling) for low-energy troughs (typically mid-afternoon).
2. **Build Buffer Blocks**: Never block your schedule 100% tight. Leave 30-60 minutes of open, unallocated time to handle unexpected issues, delays, or overrun tasks.
3. **The Theme-ing Method**: Group similar tasks together (e.g., do all your writing in one block, all your meetings in another) to reduce the high cost of task-switching.
${taskMention}Try creating a simple 3-block schedule today: Focus Block (90 mins), Admin Block (45 mins), and Recharge Block (30 mins). It keeps things simple and highly achievable!`;
  }

  // 5. Prioritize / Priority / Framework
  if (
    msgLower.includes("prioritize") || 
    msgLower.includes("priority") || 
    msgLower.includes("important") || 
    msgLower.includes("urgent") ||
    msgLower.includes("decide")
  ) {
    return `### Simplifying Your Priorities 🎯

When everything feels important, nothing is. To cut through the clutter, let's apply the **Eisenhower Matrix** to your current workload:

1. **Urgent & Important**: Do these immediately. These are your true deadlines and critical projects.
2. **Important, Not Urgent**: Schedule these. These are your strategic goals, habit building, and learning. (Most people neglect these until they become emergencies!)
3. **Urgent, Not Important**: Delegate or automate. These are minor interruptions or administrative busywork.
4. **Not Urgent & Not Important**: Eliminate. These are distractions and low-value activities.
${taskMention}Look at your pending tasks above. Which **single** item, if completed today, would make the rest of your week significantly easier or even irrelevant? Focus 100% of your energy on that item first.`;
  }

  // 6. Breakdown / Subtasks / Segment
  if (
    msgLower.includes("breakdown") || 
    msgLower.includes("break down") || 
    msgLower.includes("split") || 
    msgLower.includes("subtask") || 
    msgLower.includes("subtasks")
  ) {
    return `### Deconstructing Complex Workloads 🛠️

Large, vague goals are the primary source of procrastination because the brain doesn't know where to start. We can solve this by breaking any task down into atomic milestones:

1. **Identify the Initial Physical Action**: What is the very first physical movement required? (e.g. "Pick up pen", "Open Chrome", "Type title").
2. **The 15-Minute Segment**: Estimate how much of the task you can do in exactly 15 minutes, and treat that segment as your entire objective.
3. **Output-Oriented Milestones**: Make your subtasks concrete and measurable (e.g., "Draft outline", "Write introduction", "Self-edit paragraph 1") rather than vague (e.g. "Research").
${taskMention}Choose one of your tasks, split it into 3 clear, sequential steps that take under 20 minutes each, and focus entirely on completing step 1!`;
  }

  // 7. General / Other Custom Questions
  return `### Hello! Your TaskPilot Co-Pilot is here 🚀

I received your custom question: "${message}"

To keep you moving forward and completely optimized, here are three general high-impact strategies:

* **Clear Your Headspace**: Write down everything you need to do on a single sheet of paper. Emptying your working memory immediately reduces anxiety.
* **Launch a Focus Sprint**: Set a timer for 20 minutes, pick one task, and work on it with zero interruptions. Momentum is the ultimate antidote to hesitation.
* **Value Consistency Over Intensity**: Completing 15 minutes of work every single day builds a massive long-term compound effect, far superior to 8-hour burnout sessions.

${taskMention}Feel free to ask me more specific questions about **procrastination**, **focus strategies**, **burnout recovery**, **time-blocking schedules**, or how to **prioritize** and **break down** your active workload!`;
}

// Fallback implementations to prevent app crash when GEMINI_API_KEY is missing/invalid
function fallbackPrioritizeTasks(tasks: any[]) {
  const prioritizedTasks = tasks.map((t, index) => {
    let riskLevel = "Low";
    let riskScore = 0.2;
    if (t.priority === "high") {
      riskLevel = "Medium";
      riskScore = 0.55;
    }
    if (t.deadline && new Date(t.deadline).getTime() < Date.now() + 86400000 * 2) {
      riskLevel = "High";
      riskScore = 0.85;
    }
    return {
      taskId: t.id || t.taskId,
      suggestedOrder: index + 1,
      riskScore,
      riskLabel: riskLevel,
      reasoning: `Task "${t.title}" is scheduled based on priority "${t.priority}" and ${t.deadline ? "deadline " + t.deadline : "no strict deadline"}. (Fallback Active)`
    };
  });
  return {
    prioritizedTasks,
    overallStrategy: "TaskPilot Priority Fallback: We have sequenced your tasks by matching high priority and short deadlines first. To access full AI analytics, please configure the GEMINI_API_KEY."
  };
}

function fallbackGenerateSchedule(availableHours: number, tasks: any[]) {
  const blocks: any[] = [];
  let currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0); // Start at 9:00 AM

  const addBlock = (durationMin: number, type: string, title: string, desc: string, taskId?: string) => {
    const startStr = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
    currentTime.setMinutes(currentTime.getMinutes() + durationMin);
    const endStr = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
    blocks.push({
      startTime: startStr,
      endTime: endStr,
      type,
      title,
      associatedTaskId: taskId,
      description: desc
    });
  };

  // Generate a basic Pomodoro block schedule
  tasks.forEach((t) => {
    const duration = t.estimatedTime ? Number(t.estimatedTime) : 45;
    addBlock(duration, "focus", `Focus: ${t.title}`, "Stay locked in on your primary target.", t.id);
    addBlock(10, "break", "Recharge Break", "Get up, stretch, hydrate, rest your eyes.");
  });

  if (blocks.length === 0) {
    addBlock(60, "focus", "Deep Work Planning", "Audit your task backlog and map priorities.");
    addBlock(10, "break", "Stretch & Hydrate", "Breathe and relax.");
  }

  return {
    scheduleBlocks: blocks,
    estimatedCompletionRate: 75,
    coachInsight: "Fallback schedule activated. Tasks are scheduled in a back-to-back sequence with 10-minute micro-breaks. Configure GEMINI_API_KEY for dynamic, load-balanced schedules."
  };
}

function fallbackBreakdownTask(taskName: string, estimatedMinutes: number) {
  const subTasksCount = Math.max(3, Math.ceil(estimatedMinutes / 20));
  const subtasks = Array.from({ length: subTasksCount }).map((_, i) => ({
    title: `Subtask ${i + 1} for ${taskName}`,
    durationMinutes: Math.round(estimatedMinutes / subTasksCount),
    suggestedOrder: i + 1,
    rationale: `Deconstructed segment ${i + 1} of the workload to establish continuous focus blocks.`
  }));
  return {
    subtasks,
    coachingTip: "Focus is built step by step. Tackle subtask 1 to defeat procrastination and activate flow state."
  };
}

function fallbackGetCoachingAdvice() {
  return {
    burnoutRisk: "Medium",
    burnoutAnalysis: "Fallback Coaching Active. You have active tasks and objectives. Keep tasks scoped and monitor focus metrics closely to avoid cognitive fatigue.",
    dailyAdvice: "Set a single 'Highlight of the Day'. Keep everything else optional.",
    weeklyStrategy: "Review active goals and delete or reschedule non-essential tasks to create breathing room.",
    motivationalQuote: "The secret of getting ahead is getting started. — Mark Twain",
    tacticalSprints: [
      { title: "The 2-Minute Rule", description: "If a task takes less than 2 minutes, perform it immediately." },
      { title: "Hydration Check", description: "Drink a full glass of water right now to restore mental sharpness." }
    ]
  };
}

function fallbackPredictDeadlineRisk(task: any) {
  const hasDeadline = !!task.deadline;
  const isOverdue = hasDeadline && new Date(task.deadline).getTime() < Date.now();
  return {
    riskLevel: isOverdue ? "Critical" : hasDeadline ? "Medium" : "Low",
    probabilityPercentage: isOverdue ? 95 : hasDeadline ? 45 : 10,
    urgencyScore: isOverdue ? 10 : hasDeadline ? 6 : 2,
    suggestedNewCompletionDate: isOverdue ? new Date(Date.now() + 86400000).toISOString().split("T")[0] : task.deadline || "No deadline",
    riskExplanation: isOverdue ? "This task is currently overdue, indicating blocking resistance or underestimation." : "Standard timeframe. Monitor focus stats to prevent sudden backsliding.",
    recoveryPlan: "1. Isolate the very next action. 2. Time-box 15 minutes of uninterrupted work on it. 3. Reschedule secondary tasks if needed."
  };
}
