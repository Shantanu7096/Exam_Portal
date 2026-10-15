import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  BarChart3,
  Sparkles,
  LogOut,
  Shield,
  ShieldCheck,
  Layers,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-700/80">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-base mr-3 shadow">
            A
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Portal Admin</h1>
            <p className="text-[10px] text-slate-400">TCS / Infosys Controller</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 text-sm font-medium">
          <Link
            href="/admin"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/exams"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            <span>Exams & Tests</span>
          </Link>

          <Link
            href="/admin/results"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Results & Analytics</span>
          </Link>

          <Link
            href="/admin/exams/new"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Test Generator</span>
          </Link>

          <Link
            href="/admin/students"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span>Student Management</span>
          </Link>

          <Link
            href="/admin/faculty"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Faculty & Admins</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Live Preview
            </span>
            <Link
              href="/student/dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 mt-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Student View</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/login"
            className="flex items-center space-x-2 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Switch</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
              Administrator Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/admin/exams/new"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create AI Practice Test</span>
            </Link>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
