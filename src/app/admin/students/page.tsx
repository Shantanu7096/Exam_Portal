"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Shield, Check, RefreshCw, AlertCircle } from "lucide-react";

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    allowedAttempts: 3,
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleUpdateAttempts = async (studentId: string, attempts: number) => {
    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, allowedAttempts: attempts }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId ? { ...s, allowed_attempts: attempts } : s
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewStudent({ fullName: "", email: "", allowedAttempts: 3 });
        fetchStudents();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create student");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Candidate Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure student credentials and set max exam attempts allowed per candidate.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Candidate</span>
        </button>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Registered Candidates ({students.length})
          </span>
          <button
            onClick={fetchStudents}
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
                <th className="py-3 px-6">Candidate Name</th>
                <th className="py-3 px-6">ID / Roll No</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Max Allowed Attempts</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading candidate accounts...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No student candidates found. Create one using the button above.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {student.full_name}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                      TCS-{student.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {student.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          defaultValue={student.allowed_attempts || 3}
                          onBlur={(e) =>
                            handleUpdateAttempts(
                              student.id,
                              parseInt(e.target.value) || 3
                            )
                          }
                          className="w-16 px-2.5 py-1 border border-slate-300 rounded text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-400">Attempts</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Add New Student Candidate
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a candidate profile and configure default exam attempt limits.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudent.fullName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@college.edu"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Allowed Exam Attempts
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newStudent.allowedAttempts}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      allowedAttempts: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
