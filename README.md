# TaskPilot AI – Complete Technical & Product Specification

TaskPilot AI is an elite, intelligent, full-stack productivity companion designed to solve the "Last-Minute Life Saver" priority crisis. Powered by Gemini 2.5 and Firestore durable persistence, TaskPilot acts as an active digital co-pilot, helping professionals prioritize high-stress workloads, sequence atomic milestones, and maintain deep-work focus curves.

---

## 1. System Architecture

TaskPilot is built as a cohesive, modern full-stack web application running an Express backend to host Gemini API interactions securely and a responsive Material 3 styled React frontend.

```
+-------------------------------------------------------------+
|                       React SPA Frontend                    |
|       (Dashboard, Focus Engine, Analytics, AI Planner)       |
+------------------------------+------------------------------+
                               |
            HTTPS / JSON APIs  | (Session Sync & Auth)
                               v
+------------------------------+------------------------------+
|                    Express & Node.js Server                  |
|          (Vite Middleware & Server-Side APIs Proxy)         |
+---------------+------------------------------+--------------+
                |                              |
                | (Auth & Database Sync)       | (Secure Model Calls)
                v                              v
+---------------+------------+   +-------------+--------------+
|     Firebase Firestore     |   |         Gemini API         |
|      & Authentication      |   |      (gemini-2.5-flash)    |
+----------------------------+   +----------------------------+
```

---

## 2. Folder Structure

```
/
├── .env.example                 # Declarative environment blueprint
├── firebase-applet-config.json  # Automatic Firebase client-side settings
├── firestore.rules              # Granular Firestore security boundaries
├── index.html                   # HTML Entry canvas
├── package.json                 # Dependency manifests & compilation scripts
├── server.ts                    # Root Express full-stack entry point
├── tsconfig.json                # TypeScript compiler controls
├── vite.config.ts               # Vite bundler parameters
│
└── src/
    ├── App.tsx                  # Root state & real-time sync orchestration
    ├── firebase.ts              # Firebase client instance bootstrapping
    ├── index.css                # Global Tailwind CSS bindings
    ├── main.tsx                 # Core React DOM mounting
    ├── types.ts                 # Declarative central interfaces
    │
    ├── components/
    │   ├── AuthScreen.tsx       # Auth gateway (Email, Google, Guest Sandbox)
    │   ├── Sidebar.tsx          # Material responsive navigation
    │   ├── FocusTimer.tsx       # Pomodoro engine with custom chimes
    │   ├── DashboardView.tsx    # Streamlined stats and real-time co-pilot brief
    │   ├── TasksView.tsx        # Tasks CRUD with AI decompose & prioritization
    │   ├── PlannerView.tsx      # Generative schedules timeline block
    │   ├── GoalsView.tsx        # Long-term strategic goal tracking
    │   ├── AnalyticsView.tsx    # Recharts data curves & weekly audits
    │   ├── SettingsView.tsx     # Configuration settings toggles
    │   └── ProfileView.tsx      # Command authority levels & credential upgrades
    │
    └── server/
        └── gemini.ts            # Server-side Gemini API prompt orchestration
```

---

## 3. Installation & Run Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the project files into your local directory.
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Set up your environment credentials inside `.env` (copied from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Provide your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY="AIzaSyYourSecretKeyHere"
   ```

### Execution in Development Mode
Start the full-stack server using our hot-reloading pipeline:
```bash
npm run dev
```
The server will boot and start listening on [http://localhost:3000](http://localhost:3000).

### Compiling and Bundling for Production
Compile the React front-end and bundle the Express server into a standalone executable CJS file:
```bash
npm run build
```
Once successfully compiled, run the high-performance production server:
```bash
npm start
```

---

## 4. API Documentation

### POST `/api/gemini/prioritize`
Accepts a listing of active, uncompleted tasks and completion statistics. Returns an optimized execution list accompanied by strategic risk analysis.
- **Payload**: `{ tasks: Task[], completionHistory: FocusSession[] }`
- **Output**:
  ```json
  {
    "prioritizedTasks": [
      {
        "taskId": "u79dj",
        "suggestedOrder": 1,
        "riskScore": 0.85,
        "riskLabel": "High",
        "reasoning": "This task is placed first due to its proximity to the upcoming deadline..."
      }
    ],
    "overallStrategy": "Establish immediate concentration on the sales roadmap review..."
  }
  ```

### POST `/api/gemini/planner`
Generates an interactive, load-balanced time-blocked daily schedule based on free work hours capacity and targeted tasks.
- **Payload**: `{ availableHours: number, tasks: Task[], preferences: object }`
- **Output**: `{ scheduleBlocks: ScheduleBlock[], estimatedCompletionRate: number, coachInsight: string }`

### POST `/api/gemini/breakdown`
Deconstructs a high-friction, complex task into atomic milestones.
- **Payload**: `{ taskName: string, taskDescription: string, estimatedMinutes: number }`
- **Output**: `{ subtasks: SubTask[], coachingTip: string }`

### POST `/api/gemini/coach`
Invokes the digital co-pilot to audit pending items, compute fatigue indicators, and compile motivating feedback.
- **Payload**: `{ userStats: object, tasks: Task[], habits: Habit[] }`
- **Output**: `{ burnoutRisk: string, burnoutAnalysis: string, dailyAdvice: string, weeklyStrategy: string, motivationalQuote: string, tacticalSprints: object[] }`

---

## 5. Firebase & Security Setup

1. **Authentication Enablement**: Go to your Firebase console, navigate to the Authentication dashboard, and enable **Google Sign-In**, **Email/Password Provider**, and **Anonymous Access**.
2. **Durable Rules Deployment**: The included security guidelines inside `firestore.rules` protect user data by enforcing that a subscriber's authenticated `uid` corresponds to the respective document `userId`. Deploy using:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 6. Future Implementations & Enhancements
- **Ambient Focus Soundscapes**: Incorporate organic wave audio frequencies (White Noise, Binaural Beats) into Focus solo mode.
- **Calendar Integrations**: Synchronize timeblocks natively with Google Calendar and Outlook platforms.
- **Multiplayer Team Sprints**: Introduce collaborative shared focus channels for teams to synchronize active milestones.

---

## 7. License
This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
