"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Lock,
  Mail,
  Phone,
  Hash,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";

export default function CandidateLoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [prnNumber, setPrnNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/student/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Google authentication.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (isSignUp) {
        // Register Candidate Account
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            prnNumber: prnNumber.trim().toUpperCase(),
            mobileNumber: mobileNumber.trim(),
            email: cleanEmail,
            password: cleanPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to register candidate account.");
        }

        setSuccessMessage("Candidate account created! Logging in...");

        // Auto sign in with credentials
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (signInErr) throw signInErr;

        window.location.href = "/student/dashboard";
      } else {
        // Sign In Candidate
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          throw error;
        }

        setSuccessMessage("Authentication successful! Redirecting...");
        window.location.href = "/student/dashboard";
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMessage(err.message || "Authentication failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-2xl shadow-xl shadow-blue-600/30">
          iON
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Candidate Examination Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          TCS iON & Infosys Proctored Placement Test Suite
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* Tab Selector: Sign In vs Register */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                !isSignUp
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Candidate Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                isSignUp
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center justify-center space-x-2.5 mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          <p className="text-[10px] text-slate-500 text-center -mt-4 mb-4">
            Requires Google OAuth configured in Supabase. Or register below with your PRN.
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                Or with candidate credentials
              </span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Candidate Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shantanu Patil"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    PRN Number / College Roll Number
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2024CS0192"
                      value={prnNumber}
                      onChange={(e) => setPrnNumber(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="candidate@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
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
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Register Candidate & Start" : "Sign In to Assessments"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Admin Controller Portal Link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">
              Exam Administrator or Faculty Staff?
            </span>
            <Link
              href="/admin/login"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition"
            >
              Access Controller Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
