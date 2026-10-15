import React from "react";
import Link from "next/link";
import { BookOpen, User, LogOut, CheckCircle, Award } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              iON
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base">Candidate Portal</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
                TCS / Infosys Assessment Suite
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/student/dashboard"
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition"
            >
              My Assessments
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-md transition flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch User</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
