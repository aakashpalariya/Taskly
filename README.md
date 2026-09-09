# ⚡ Taskly — Smart Task Management & Focus Platform

<p align="center">
  <strong>A modern, high-performance task management and productivity suite built with Next.js 16, React 19, TypeScript, and SQLite.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/SQLite-node%3Asqlite_%2F_better--sqlite3-003B57?style=for-the-badge&logo=sqlite" alt="SQLite" />
</p>

---

## 📖 Overview

**Taskly** is designed for high-velocity personal productivity and team task planning. Combining natural language task creation, multiple visualization modes (List, Kanban, Calendar), an integrated Pomodoro focus timer, deep analytics, and an administrative control center, Taskly brings together all your workflows in a snappy, offline-resilient package.

---

## ✨ Key Features

### 📥 Smart Task Management & Views
- **Inbox**: Quick-capture bucket for all unscheduled thoughts and ideas.
- **Today**: Real-time view for today's commitments featuring an overdue alert banner.
- **Upcoming**: Chronological timeline segmented into *Tomorrow*, *This Week*, and *Later*.
- **Completed**: Searchable achievement archive with one-click task restoration.
- **Projects & Folders**: Custom project folders with bespoke icons, color accents, and favorite pinning.
- **Tags & Labels**: Flexible colored tags (e.g. `#urgent`, `#client`, `#quick-win`).
- **Recurring Tasks**: Automatic recurrence engine supporting daily, weekly, and monthly cycles.
- **Subtask Checklists**: Interactive subtask items with live progress percentage indicators.

### 🧠 Natural Language Processing (NLP) Quick-Add
Type naturally to create tasks in seconds with real-time token detection:
```text
"Review sprint backlog tomorrow at 3pm !high #engineering ~45m"
```
- **Dates & Times**: `today`, `tomorrow`, `next monday`, `at 10:30am`
- **Priorities**: `!low`, `!medium`, `!high`, `!urgent`
- **Projects**: `#work`, `#personal`, `#health`
- **Estimated Duration**: `~25m`, `~1h`

### 📊 Multiple Visualization Modes
- **List View**: Drag-and-drop manual ordering, inline detail drawer, and quick checkbox completion.
- **Kanban Board**: Drag and drop cards seamlessly across *To Do*, *In Progress*, and *Completed* columns.
- **Calendar View**: Full interactive monthly grid with day-by-day task badges and instant scheduling.

### ⏱️ Integrated Pomodoro & Deep Focus
- Built-in timer with **Focus (25m)**, **Short Break (5m)**, and **Long Break (15m)** intervals.
- Connect any session directly to an active task.
- Audio chimes and ambient alert cues for session transitions.

### 📈 Productivity Analytics & Dashboard
- **7-Day Velocity Chart**: Visualized with Recharts to monitor daily completion throughput.
- **Streak Tracker**: Keep your daily momentum going.
- **Priority & Status Breakdown**: Understand where your time is being invested.

### 🛡️ Built-in Admin Dashboard (`/admin`)
- Master administrative dashboard for system operators.
- Real-time user metrics, task counts, and focus time stats.
- User management: account activation/deactivation, password reset, and user deletion.
- Audit trail logging system events and administrative actions.

### 🎨 Delightful UX & Polish
- **Dark & Light Mode**: Seamless theme switching with persistent user preference.
- **5-Second Undo Toast**: Never worry about accidental completions or deletions.
- **Confetti Celebrations**: Satisfying celebratory blast when clearing your daily queue.
- **Keyboard-First Design**: Designed for power users with shortcut navigation.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Q</kbd> or <kbd>C</kbd> | Open Natural Language Quick-Add Modal |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Open Command Palette & Quick Search |
| <kbd>Enter</kbd> | Submit task in Quick Add |
| <kbd>Esc</kbd> | Close any active Drawer or Modal |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Database** | SQLite via Node 22 native `node:sqlite` (with `better-sqlite3` fallback) |
| **Offline Cache** | [Dexie (IndexedDB)](https://dexie.org/) |
| **Authentication** | Secure HMAC-signed session cookies with `bcryptjs` password hashing |

---

## 📁 Project Structure

```text
taskly/
├── data/                    # SQLite database storage (taskly.db)
├── public/                  # Static assets & audio notifications
├── src/
│   ├── app/                 # Next.js App Router routes & API endpoints
│   │   ├── (auth)/          # Authentication pages (Login, Signup)
│   │   ├── (dashboard)/     # Main dashboard views (Inbox, Today, Board, Calendar, etc.)
│   │   ├── admin/           # Operator Admin Dashboard
│   │   └── api/             # RESTful API endpoints (Tasks, Projects, Admin, etc.)
│   ├── components/          # Modular UI & view components
│   │   ├── board/           # Kanban board implementation
│   │   ├── calendar/        # Interactive calendar views
│   │   ├── layout/          # Sidebar, Navbar, and Command Palette
│   │   ├── pomodoro/        # Focus timer components
│   │   ├── tasks/           # Task items, drawers, filters, and quick-add
│   │   └── ui/              # Reusable buttons, inputs, modals, and toasts
│   ├── context/             # Global React state (Theme, Auth, Toast, etc.)
│   ├── db/                  # Client-side Dexie IndexedDB setup
│   ├── lib/                 # NLP parser, date formatting, and utilities
│   └── server/              # Server-side business logic and SQLite queries
│       └── db/              # SQLite connection, migrations, seed, and queries
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version `20.x` or later (Node 22+ recommended for native `node:sqlite`)
- **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aakashpalariya/Taskly.git
   cd Taskly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Credentials

The database seeds automatically on initial startup. You can sign in using:

### Demo User Account
- **Email**: `demo@taskly.app`
- **Password**: `Demo@123`
- **Date of Birth**: `01/01/2001` (stored as `2001-01-01`)
- *(Or simply click **Auto Fill** on the login page)*

### Admin Dashboard (`/admin`)
- **Access Route**: `/admin`
- **Master Password**: `Admin@Taskly2025`

---

## 📦 Production Build

To build and run the optimized production bundle:

```bash
# Build Next.js application
npm run build

# Start production server
npm start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
