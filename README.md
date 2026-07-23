<div align="center">

# 🚀 TaskPilot AI

### *Intelligent Productivity & Focus Co-Pilot*

TaskPilot AI is an elite, full-stack productivity engine engineered to solve workload crises. Powered by **Google Gemini 2.5** and **Firebase Firestore**, TaskPilot AI acts as an active digital co-pilot—helping professionals prioritize high-stress task lists, sequence atomic milestones, and maintain optimal deep-work focus curves.

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-TaskPilot_AI-3b82f6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://ais-dev-kitje26wwnn4eqqsgapgpx-364424223521.asia-southeast1.run.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/riddhimoy/taskpilot-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br/>

[![React](https://img.shields.io/badge/Frontend-React_18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Gemini API](https://img.shields.io/badge/AI-Gemini_2.5_Flash-8e44ad?style=flat-square&logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Database-Firebase_Firestore-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Key Features

- 🤖 **AI Workload Prioritizer & Risk Analyzer**: Intelligently computes task risk scores, urgency metrics, and generates optimized execution sequences.
- 📅 **Generative Time-Block Planner**: Dynamically maps daily capacities into balanced hourly focus blocks with buffer times.
- 🧩 **Atomic Task Decomposition**: Deconstructs complex, high-friction objectives into actionable subtasks with tactical tips.
- 🔥 **Habit & Streak Engine**: Visual streak indicators with progress ring completion and celebratory confetti animations.
- ⏱️ **Integrated Focus Timer**: Custom Pomodoro engine with ambient notification chimes, mode controls, and session logs.
- 📊 **Real-Time Productivity Analytics**: Interactive Recharts visualizers tracking completion curves, volume distributions, and weekly audits.
- 🔍 **Global Real-Time Search**: Instant search across tasks, goals, habits, and focus logs with hotkey (`⌘K`) support.
- 🌓 **Adaptive Theme Engine**: Smooth dark and light mode synchronization across all surfaces, cards, and modals.

---

## 🛠️ Tech Stack & Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Motion / Framer Motion, Lucide Icons, Recharts, Vite
- **Backend**: Node.js, Express.js (serving REST endpoints & Vite dev middleware)
- **AI Integration**: Google Gemini API (`@google/genai` with `gemini-2.5-flash`)
- **Database & Auth**: Firebase Firestore & Firebase Authentication

### System Architecture

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

## 📁 Directory Structure

```
/
├── .env.example                 # Environment variables specification
├── firebase-applet-config.json  # Firebase client configuration
├── firestore.rules              # Firestore security rules
├── server.ts                    # Root Express full-stack entry point
├── src/
│   ├── App.tsx                  # Root state & real-time sync orchestration
│   ├── firebase.ts              # Firebase client initialization
│   ├── types.ts                 # Central TypeScript interface definitions
│   ├── components/              # Modular UI view controllers
│   └── server/
│       └── gemini.ts            # Server-side Gemini API prompt orchestration
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/gemini/prioritize` | `POST` | Computes priority ordering, risk scores, and tactical strategies for pending tasks. |
| `/api/gemini/planner` | `POST` | Generates an interactive, load-balanced daily schedule based on free hours. |
| `/api/gemini/breakdown` | `POST` | Deconstructs complex tasks into atomic subtasks with coaching advice. |
| `/api/gemini/coach` | `POST` | Evaluates fatigue metrics, burnout risks, and delivers motivational co-pilot guidance. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/riddhimoy/taskpilot-ai.git
   cd taskpilot-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key inside `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/riddhimoy/taskpilot-ai/issues).

Distributed under the **MIT License**.

<div align="center">

⭐ **If you find TaskPilot AI useful, please consider giving the repository a star!** ⭐

</div>
