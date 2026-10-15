"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function AdminExamsListPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/exams");
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleToggleStatus = async (examId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setExams((prev) =>
          prev.map((e) =>
            e.id === examId ? { ...e, is_active: !currentStatus } : e
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Exams & Assessments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure Mock Tests, AI-generated Practice Tests, questions, and attempt parameters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/exams/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Practice Test</span>
          </Link>

          <Link
            href="/admin/exams/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Mock Test</span>
          </Link>
        </div>
      </div>

      {/* Exams Grid/Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Total Configured Exams ({exams.length})
          </span>
          <button
            onClick={fetchExams}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Assessment Title</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">Questions</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading exams...
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No exams found. Click "Create Mock Test" or "AI Practice Test" to get started.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>{exam.title}</span>
                          {exam.isScheduled && exam.startTime ? (
                            <span className="inline-flex items-center text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded">
                              Scheduled: {new Date(exam.startTime).toLocaleDateString()} {new Date(exam.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              On-Demand
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">
                          {exam.summary || (typeof exam.description === "string" && !exam.description.startsWith("{") ? exam.description : "No description provided.")}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          exam.type === "practice"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {exam.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      {exam.duration} mins
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-semibold text-xs">
                      {exam.total_questions || 0}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(exam.id, exam.is_active)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded transition ${
                          exam.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {exam.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="inline-block px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
                      >
                        Manage Questions
                      </Link>
                      <Link
                        href={`/exam/${exam.id}`}
                        className="inline-block px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded text-xs font-semibold"
                      >
                        Live Test
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
