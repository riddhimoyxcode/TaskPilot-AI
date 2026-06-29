import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  aiPrioritizeTasks,
  aiGenerateSchedule,
  aiBreakdownTask,
  aiGetCoachingAdvice,
  aiPredictDeadlineRisk,
  aiChatAssistant
} from "./src/server/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  // Middleware
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Gemini AI Route: Task Prioritizer
  app.post("/api/gemini/prioritize", async (req, res) => {
    try {
      const { tasks, completionHistory } = req.body;
      const result = await aiPrioritizeTasks(tasks || [], completionHistory || []);
      res.json(result);
    } catch (err: any) {
      console.error("Prioritize API Error:", err);
      res.status(500).json({ error: err.message || "Failed to prioritize tasks" });
    }
  });

  // Gemini AI Route: Generate Time-blocked Schedule
  app.post("/api/gemini/planner", async (req, res) => {
    try {
      const { availableHours, tasks, preferences } = req.body;
      const result = await aiGenerateSchedule(
        Number(availableHours) || 4,
        tasks || [],
        preferences || {}
      );
      res.json(result);
    } catch (err: any) {
      console.error("Planner API Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate schedule" });
    }
  });

  // Gemini AI Route: Break Down Task
  app.post("/api/gemini/breakdown", async (req, res) => {
    try {
      const { taskName, taskDescription, estimatedMinutes } = req.body;
      const result = await aiBreakdownTask(
        taskName || "Untitled Task",
        taskDescription || "",
        Number(estimatedMinutes) || 30
      );
      res.json(result);
    } catch (err: any) {
      console.error("Breakdown API Error:", err);
      res.status(500).json({ error: err.message || "Failed to break down task" });
    }
  });

  // Gemini AI Route: Get Coaching Advice
  app.post("/api/gemini/coach", async (req, res) => {
    try {
      const { userStats, tasks, habits } = req.body;
      const result = await aiGetCoachingAdvice(
        userStats || {},
        tasks || [],
        habits || []
      );
      res.json(result);
    } catch (err: any) {
      console.error("Coaching API Error:", err);
      res.status(500).json({ error: err.message || "Failed to get coaching advice" });
    }
  });

  // Gemini AI Route: Predict Deadline Risk
  app.post("/api/gemini/predict", async (req, res) => {
    try {
      const { task, recentVelocity } = req.body;
      const result = await aiPredictDeadlineRisk(
        task || {},
        recentVelocity || {}
      );
      res.json(result);
    } catch (err: any) {
      console.error("Predict API Error:", err);
      res.status(500).json({ error: err.message || "Failed to predict deadline risk" });
    }
  });

  // Gemini AI Route: Conversational Chat Assistant
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      const result = await aiChatAssistant(message || "", context || {}, history || []);
      res.json(result);
    } catch (err: any) {
      console.error("Chat API Error:", err);
      res.status(500).json({ error: err.message || "Failed to process chat" });
    }
  });

  // Vite development integration or production build hosting
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskPilot AI server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
