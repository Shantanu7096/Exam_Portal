import Link from "next/link";
import { Shield, Sparkles, BookOpen, CheckCircle, ArrowRight, Layers, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md">
              iON
            </div>
            <div>
              <span className="font-bold text-base tracking-wide">Assessment Portal</span>
              <span className="ml-2 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                TCS & Infosys Clone
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow"
            >
              Sign In / Access Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Full-Screen Proctoring & Anti-Cheat Tab Detection</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          Enterprise Placement Exam &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
            AI Practice Portal
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Pixel-perfect replication of TCS iON and Infosys assessment interfaces with
          split-screen palettes, 3-strike tab anti-cheat, and automated question generation
          via Google Gemini AI.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Launch Student Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Admin Control Center</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">TCS / Infosys Split UI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              5-state color-coded Question Palette (Gray, Red, Green, Purple, Purple-with-Dot) with Save & Next, Clear Response, and Review toggles.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Strict Anti-Cheat Proctoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces Javascript Fullscreen lock and tracks tab changes via <code>visibilitychange</code>. Automatically disqualifies upon 3 warnings.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Gemini AI Test Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste textbook chapters or syllabus documents to automatically generate technical MCQs, pseudocode tracing, and logic questions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Enterprise Placement Assessment Engine • Next.js App Router, Supabase & Google Gemini AI
      </footer>
    </div>
  );
}
