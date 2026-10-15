"use client";

import React, { useState } from "react";
import { Database, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SeedDatabaseButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm("Seed the database with sample TCS NQT and Infosys tests?")) return;

    try {
      setLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        alert("Seed error: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading || success}
      className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Seeding...</span>
        </>
      ) : success ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700">Database Seeded!</span>
        </>
      ) : (
        <>
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Seed Sample Exams</span>
        </>
      )}
    </button>
  );
}
