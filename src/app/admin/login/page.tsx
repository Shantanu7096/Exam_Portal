"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // If already authenticated as admin, automatically forward to /admin
  useEffect(() => {
    let isMounted = true;
    const checkActiveSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isMounted) {
          const role = user.user_metadata?.role;
          if (role === "admin" || user.email === "admin@exam.com") {
            setSuccessMessage("Active admin session detected. Redirecting...");
            window.location.href = "/admin";
            return;
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    };

    checkActiveSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickFill = () => {
    setEmail("admin@exam.com");
    setPassword("AdminPassword@123");
    setErrorMessage(null);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate via Server API to set standard HTTP cookies
      const serverRes = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const serverData = await serverRes.json();
      if (!serverRes.ok) {
        throw new Error(serverData.error || "Failed to authenticate administrator.");
      }

      // 2. Synchronize client-side supabase session
      try {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
      } catch (clientErr) {
        // Server cookie already set
        console.warn("Client sync warning:", clientErr);
      }

      setSuccessMessage("Credentials verified! Launching Admin Console...");

      // Hard redirect to ensure all auth cookies are delivered directly to Next.js middleware
      setTimeout(() => {
        window.location.href = "/admin";
      }, 200);
    } catch (err: any) {
      console.error("Admin login error:", err);
      let msg = err.message || "Failed to authenticate administrator.";
      if (msg.includes("Invalid login credentials")) {
        msg = "Invalid email or password. Please verify your credentials or click 'Auto-Fill Super Admin'.";
      }
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-purple-600/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Exam Controller Portal
        </h2>
        <p className="mt-1.5 text-xs text-purple-300 font-semibold uppercase tracking-wider">
          Restricted Administrator Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {checkingAuth && (
            <div className="mb-4 text-center text-xs text-purple-300 flex items-center justify-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying current session...</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Credential Helper Pill */}
          <div className="mb-5 p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl flex items-center justify-between">
            <div className="text-[11px] text-purple-200">
              <p className="font-semibold text-white">Default Admin Account</p>
              <p className="text-purple-400 font-mono text-[10px]">admin@exam.com</p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-bold flex items-center space-x-1 transition shadow"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Fill</span>
            </button>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@exam.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(successMessage)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Controller</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <a
              href="/login"
              className="text-xs text-slate-400 hover:text-slate-300 transition"
            >
              &larr; Return to Candidate Examination Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
