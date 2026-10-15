"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Search,
  Trash2,
  Lock,
  Mail,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

export default function FacultyAdminPortalPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    designation: "Faculty / Exam Coordinator",
    email: "",
    password: "",
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Account created successfully!");
        setShowAddModal(false);
        setFormData({
          fullName: "",
          designation: "Faculty / Exam Coordinator",
          email: "",
          password: "",
        });
        fetchStaff();
      } else {
        alert(data.error || "Failed to create account.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, email: string) => {
    if (email === "admin@exam.com") {
      alert("The primary Super Administrator account cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to revoke access and delete account for ${email}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setStaff((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.error || "Failed to remove account.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Faculty & Administrator Portal
              </h1>
              <p className="text-sm text-slate-500">
                Manage professors, exam coordinators, and administrative officers with elevated access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStaff}
            className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Faculty / Admin</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Authorized Staff
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {staff.length}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Full admin privileges
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verified Accounts
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {staff.filter((s) => s.isVerified).length} / {staff.length}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Instant login enabled
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dedicated Admin Gateway
            </p>
            <h3 className="text-base font-bold text-white mt-1">
              /admin/login
            </h3>
            <Link
              href="/admin/login"
              target="_blank"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 mt-1 transition"
            >
              Test login portal <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredStaff.length} of {staff.length} staff members
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-5">Designation / Role</th>
                <th className="py-3 px-5">Email Address</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Created On</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading faculty & admin accounts...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No faculty or administrator found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {member.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {member.designation}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-slate-700 font-mono text-xs">
                      {member.email}
                    </td>

                    <td className="py-3.5 px-5">
                      {member.isVerified ? (
                        <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-xs text-slate-500">
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {member.email === "admin@exam.com" ? (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          Primary Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.email)}
                          disabled={deletingId === member.id}
                          className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 font-medium px-2.5 py-1 rounded hover:bg-rose-50 border border-rose-200 transition disabled:opacity-50"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {deletingId === member.id ? "Deleting..." : "Revoke"}
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Guidance Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 text-sm">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">
              Access Control & Security Policy
            </h4>
            <p className="text-amber-800 text-xs leading-relaxed">
              Staff members created here have elevated permissions to create exams, upload confidential reference notes, launch AI test generators, inspect student anti-cheat logs, and export candidate performance sheets to Excel (.xlsx).
            </p>
            <p className="text-amber-800 text-xs font-semibold pt-1">
              Staff must log in at <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">/admin/login</code>. Candidate registration (/login) will never grant administrative privileges.
            </p>
          </div>
        </div>
      </div>

      {/* Add Faculty / Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Add Faculty / Admin
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create a verified portal administrator or faculty evaluator
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Rajesh Sharma"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Designation / Department
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOD - Computer Science / Chief Invigilator"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. faculty@university.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Account will be automatically verified for immediate login at <b>/admin/login</b>.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Creating Account..." : "Create Verified Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
