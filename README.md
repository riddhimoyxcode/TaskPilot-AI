<div align="center">

# 👋 Hi there, I'm Riddhimoy Mondal

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=3b82f6&center=true&vCenter=true&width=600&height=50&lines=Full-Stack+AI+Engineer;ECE+Scholar+%26+Developer;Building+Intelligent+Web+Applications;Gemini+API+%26+Firebase+Specialist" alt="Typing SVG" />
</a>

<p align="center">
  <b>Passionate Software Engineer & AI Specialist crafting performant, intuitive, and scalable digital experiences.</b>
</p>

[![Profile Views](https://komarev.com/ghpvc/?username=riddhimoy&color=blue&style=flat-square&label=Profile+Views)](https://github.com/riddhimoy)
[![GitHub Followers](https://img.shields.io/github/followers/riddhimoy?style=flat-square&color=3b82f6&logo=github)](https://github.com/riddhimoy)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/riddhimoy)
[![Email](https://img.shields.io/badge/Email-Contact_Me-ea4335?style=flat-square&logo=gmail&logoColor=white)](mailto:riddhimoymondal.ece@gmail.com)

---

</div>

## 👨‍💻 About Me

```yaml
Name: Riddhimoy Mondal
Degree: Electronics & Communication Engineering (ECE)
Role: Full-Stack AI Engineer & Open Source Contributor
Current Focus: Generative AI Orchestration, Real-time Architectures & High-Performance Web Apps
Learning: Advanced LLM Agent Architectures, Multi-Agent Swarms & Cloud Native Systems
Goals: Building impactful open-source tools that solve real-world productivity & engineering problems
Fun Fact: I turn high-stress deadlines into structured atomic milestones! 🚀
```

---

## 🛠️ Tech Stack

<div align="center">

### Languages & Frameworks
[![My Skills](https://skillicons.dev/icons?i=ts,js,py,cpp,html,css,react,nextjs,nodejs,express,tailwind,vite)](https://skillicons.dev)

### Databases, Cloud & AI
[![Cloud Skills](https://skillicons.dev/icons?i=firebase,gcp,postgres,mongodb,git,github,vscode,postman)](https://skillicons.dev)

</div>

<br/>

<details>
<summary><b>🔍 Detailed Technology Breakdown</b></summary>
<br/>

| Category | Technologies & Tools |
| :--- | :--- |
| **Languages** | TypeScript, JavaScript (ES6+), Python, C++, HTML5, CSS3, SQL |
| **Frontend** | React 18, Next.js, Tailwind CSS, Motion / Framer Motion, Recharts, Vite |
| **Backend** | Node.js, Express.js, RESTful APIs, Server-Sent Events, WebSockets |
| **AI & ML** | Google Gemini API (`@google/genai`), Prompt Engineering, Generative Planning |
| **Database & Cloud** | Firebase (Firestore & Authentication), Cloud Run, GCP, PostgreSQL, MongoDB |
| **Tools & DevOps** | Git, GitHub, Postman, ESLint, npm, Vite, VS Code |

</details>

---

## 🚀 Featured Project

### 🌟 [TaskPilot AI](https://github.com/riddhimoy) – Intelligent Productivity & Focus Co-Pilot

> **"The Last-Minute Life Saver" Priority Engine**
> TaskPilot AI is an elite, intelligent, full-stack productivity companion designed to solve workload crises. Powered by Gemini 2.5 and Firestore durable persistence, TaskPilot acts as an active digital co-pilot—helping professionals prioritize high-stress workloads, sequence atomic milestones, and maintain deep-work focus curves.

<div align="center">

[![React](https://img.shields.io/badge/Frontend-React_18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Gemini API](https://img.shields.io/badge/AI-Gemini_2.5_Flash-8e44ad?style=flat-square&logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Database-Firebase_Firestore-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

#### Key Features
- **🤖 AI Workload Prioritizer & Risk Analyzer**: Computes task risk scores and generates optimized execution sequences.
- **📅 Generative Time-Block Planner**: Dynamically maps daily capacities into balanced hourly focus schedules.
- **🧩 Atomic Task Decomposition**: Breaks complex, high-friction objectives into manageable subtasks.
- **🔥 Habit & Streak Engine**: Features progress rings and celebration animations to reinforce consistency.
- **⏱️ Integrated Focus Timer**: Custom Pomodoro engine with ambient chimes and session tracking.
- **📊 Real-time Analytics**: Recharts-powered productivity curves, completion metrics, and weekly audits.

#### System Architecture

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

#### Technical Directory Structure
```
/
├── .env.example                 # Declarative environment blueprint
├── firebase-applet-config.json  # Automatic Firebase client-side settings
├── firestore.rules              # Granular Firestore security boundaries
├── server.ts                    # Root Express full-stack entry point
├── src/
│   ├── App.tsx                  # Root state & real-time sync orchestration
│   ├── firebase.ts              # Firebase client instance bootstrapping
│   ├── types.ts                 # Declarative central interfaces
│   ├── components/              # Modular UI view controllers
│   └── server/
│       └── gemini.ts            # Server-side Gemini API prompt orchestration
```

#### API Endpoints
- `POST /api/gemini/prioritize` – Computes priority order, risk scores, and tactical strategies for pending tasks.
- `POST /api/gemini/planner` – Generates an interactive, load-balanced daily schedule based on free hours.
- `POST /api/gemini/breakdown` – Deconstructs complex tasks into atomic subtasks with coaching tips.
- `POST /api/gemini/coach` – Evaluates fatigue metrics, burnout risks, and delivers motivational co-pilot advice.

#### Quick Start
```bash
# Clone repository
git clone https://github.com/riddhimoy/taskpilot-ai.git
cd taskpilot-ai

# Install dependencies & set environment variables
npm install
cp .env.example .env

# Run development mode
npm run dev

# Build for production
npm run build && npm start
```

---

## 📊 GitHub Analytics

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=riddhimoy&show_icons=true&theme=tokyonight&border_radius=12&hide_border=true" alt="GitHub Stats" width="48%" />
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=riddhimoy&layout=compact&theme=tokyonight&border_radius=12&hide_border=true" alt="Top Languages" width="48%" />

<br/>

<img src="https://github-readme-streak-stats.herokuapp.com/?user=riddhimoy&theme=tokyonight&hide_border=true&border_radius=12" alt="GitHub Streak" width="97%" />

</div>

---

## 🏆 Achievements & Certifications

- **🎓 ECE Engineering Excellence**: Strong foundational expertise in hardware-software co-design and system signal processing.
- **🤖 Full-Stack AI Integration Specialist**: Architected server-side Gemini LLM proxies with fail-safe error handling and streaming.
- **⚡ Open Source Contributor**: Actively building and maintaining public developer tools and web productivity apps.

---

## 📬 Connect With Me

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/riddhimoy)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/riddhimoy)
[![Email](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:riddhimoymondal.ece@gmail.com)
[![LeetCode](https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=black)](https://leetcode.com)
[![CodeChef](https://img.shields.io/badge/CodeChef-5B4638?style=for-the-badge&logo=codechef&logoColor=white)](https://codechef.com)
[![HackerRank](https://img.shields.io/badge/HackerRank-2EC866?style=for-the-badge&logo=hackerrank&logoColor=white)](https://hackerrank.com)
[![X / Twitter](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://twitter.com)

</div>

---

<div align="center">

### ⭐️ Don't forget to star my repositories if you find them helpful!

*Crafted with precision by Riddhimoy Mondal*

</div>
