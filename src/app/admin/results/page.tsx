"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Award,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error("Results fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Filtered Results
  const filtered = results.filter((r) => {
    const studentName = r.profiles?.full_name?.toLowerCase() || "";
    const examTitle = r.exams?.title?.toLowerCase() || "";
    const matchesSearch =
      studentName.includes(searchQuery.toLowerCase()) ||
      examTitle.includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Analytics Computations
  const totalAttempts = results.length;
  const completedAttempts = results.filter((r) => r.status === "completed");
  const disqualifiedAttempts = results.filter((r) => r.status === "disqualified");

  const avgScore =
    completedAttempts.length > 0
      ? (
          completedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          completedAttempts.length
        ).toFixed(1)
      : "0";

  const highestScore = results.reduce(
    (max, curr) => Math.max(max, curr.score || 0),
    0
  );

  // Excel Export
  const handleExportExcel = () => {
    const rows = filtered.map((r, index) => ({
      "Sr No.": index + 1,
      "Candidate Name": r.profiles?.full_name || "Unknown Candidate",
      "Roll Number": `TCS-${(r.user_id || "STUDENT").substring(0, 8).toUpperCase()}`,
      "Assessment Title": r.exams?.title || "Assessment",
      "Assessment Type": (r.exams?.type || "mock").toUpperCase(),
      "Score Obtained": r.score ?? 0,
      "Status": r.status === "disqualified" ? "DISQUALIFIED" : "COMPLETED",
      "Security Violations": r.violation_count || 0,
      "Completion Date": r.completed_at
        ? new Date(r.completed_at).toLocaleString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exam Results");

    // Auto-fit column widths
    const maxCols = [
      { wch: 8 },  // Sr No
      { wch: 22 }, // Name
      { wch: 16 }, // Roll No
      { wch: 35 }, // Exam Title
      { wch: 16 }, // Exam Type
      { wch: 16 }, // Score
      { wch: 16 }, // Status
      { wch: 20 }, // Security Violations
      { wch: 24 }, // Date
    ];
    worksheet["!cols"] = maxCols;

    const fileName = `Assessment_Results_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Assessment Results & Candidate Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review live scores, track proctoring security infractions, and export performance reports to Excel.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={filtered.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download in Excel Sheet (.xlsx)</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalAttempts}
            </div>
            <span className="text-[11px] text-blue-600 font-medium">
              Candidates Evaluated
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Score
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {avgScore} Marks
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Across Completed Tests
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Highest Score
            </span>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {highestScore} Marks
            </div>
            <span className="text-[11px] text-purple-600 font-medium">
              Top Performance
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Disqualified
            </span>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {disqualifiedAttempts.length}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">
              Proctoring Infractions
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Results Table & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="disqualified">Disqualified Only</option>
            </select>

            <button
              onClick={fetchResults}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-slate-600"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Candidate Name</th>
                <th className="py-3 px-6">Assessment Title</th>
                <th className="py-3 px-6">Score</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Violations</th>
                <th className="py-3 px-6">Submitted Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading candidate results...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching assessment results found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isDisqualified = item.status === "disqualified";
                  const rollNo = `TCS-${(item.user_id || "STUDENT").substring(0, 8).toUpperCase()}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">
                          {item.profiles?.full_name || "Candidate Student"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Roll: {rollNo}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {item.exams?.title || "Assessment"}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {item.exams?.type || "mock"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.score ?? 0}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          {" "}Marks
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isDisqualified
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isDisqualified ? "Disqualified" : "Completed"}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {item.violation_count > 0 ? (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {item.violation_count} Flag(s)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "In Progress"}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/student/results/${item.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Review</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
