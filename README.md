# TCS iON & Infosys Online Exam Portal

A full-stack, enterprise-grade assessment platform replicating the **TCS iON** and **Infosys** recruitment examination interfaces. Features manual mock test creation, Google Gemini AI study material question synthesis, anti-cheat full-screen proctoring, live student scoring, and administrative Excel analytics export.

---

## 🚀 Key Features

### 1. Proctoring & Anti-Cheat Live Exam Runner
- **HTML5 Fullscreen API Enforcement**: Prevents students from minimizing or leaving the exam screen.
- **Tab Switching Detection**: Active listeners on `visibilitychange` and `blur` events log real-time infractions.
- **Auto-Submission**: On the 3rd security infraction, the session auto-submits with a disqualification status.
- **TCS iON Split-Screen Palette**: 5-state color-coded numbered grid (Gray: Not Visited, Red: Unanswered, Green: Answered, Purple: Review, Purple-with-Dot: Answered & Review).
- **Persistent State**: Local caching + 15-second background sync to Supabase so candidates resume from the exact second and question upon page reloads.

### 2. Immediate Student Results & Scorecard
- Instant post-exam scorecard showing overall score, percentage, correct/incorrect/unattempted breakdown.
- Question-by-question review highlighting wrong options in red strikethrough (✗) alongside correct options (✓).

### 3. Admin Control Center & Excel Analytics
- **Live Performance Dashboard**: Average score, top marks, and infraction tracking.
- **One-Click Excel Export**: Download candidate records into formatted `.xlsx` spreadsheets using `xlsx`.
- **AI Practice Test Generator**: Ingest textbook chapters or syllabus notes to extract technical MCQs and pseudocode tracing questions via Google Gemini API.
- **Student Attempt Management**: Set and adjust `allowed_attempts` per candidate.
- **One-Click Database Seeder**: Instantly populate real TCS NQT and Infosys DSE mock exams.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, Lucide React
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, SSR Cookies Auth)
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Spreadsheet Engine**: `xlsx`
- **Deployment**: Vercel

---

## ⚙️ Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Execute Database Schema**:
   Run the SQL script from Supabase SQL Editor to initialize `profiles`, `exams`, `questions`, `user_exams`, and `responses`.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.
