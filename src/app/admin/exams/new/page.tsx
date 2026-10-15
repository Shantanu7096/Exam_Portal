"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, FileText, CheckCircle2, Loader2, ArrowRight, BookOpen } from "lucide-react";

export default function NewExamPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");

  // AI Generator Form State
  const [aiExamTitle, setAiExamTitle] = useState("");
  const [aiDuration, setAiDuration] = useState(30);
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiTextContent, setAiTextContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualDuration, setManualDuration] = useState(45);
  const [manualDescription, setManualDescription] = useState("");
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Sample study text button for quick testing
  const loadSampleText = () => {
    setAiExamTitle("TCS NQT Dynamic Programming & Sorting Practice");
    setAiTextContent(`
Chapter 4: Algorithmic Efficiency and Divide-and-Conquer
In computational problem solving, asymptotic notation describes algorithm scalability. MergeSort divides an array into two halves, recursively sorts them, and merges them in linear time O(N), guaranteeing an overall worst-case complexity of O(N log N). However, MergeSort requires O(N) auxiliary space for arrays.
In contrast, HeapSort achieves O(N log N) time complexity in-place with O(1) auxiliary space by building a max-heap and repeatedly extracting the root.
QuickSort offers average-case O(N log N) time with low constant factors, but degrades to O(N^2) if the pivot selection consistently yields unbalanced partitions.
In Dynamic Programming, overlapping subproblems and optimal substructure are required. Memoization follows a top-down recursive caching technique, whereas Tabulation constructs a bottom-up table to avoid recursion call stack overhead.
For bitwise logic in pseudocode:
Integer a = 5 (binary 0101), Integer b = 3 (binary 0011).
Bitwise AND (a & b) results in 0001 (decimal 1). Bitwise OR (a | b) results in 0111 (decimal 7). Bitwise XOR (a ^ b) yields 0110 (decimal 6).
    `.trim());
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTextContent.trim()) {
      alert("Please paste study material or book text.");
      return;
    }

    try {
      setIsGenerating(true);
      setAiResult(null);

      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examTitle: aiExamTitle || "AI Practice Test",
          duration: aiDuration,
          questionCount: aiQuestionCount,
          textContent: aiTextContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate practice test");
      }

      setAiResult(data);
    } catch (err: any) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingManual(true);
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          duration: manualDuration,
          description: manualDescription,
          type: "mock",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/exams/${data.exam.id}`);
      } else {
        alert(data.error || "Failed to create mock exam");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsCreatingManual(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create New Assessment
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose between Google Gemini AI test synthesis from study materials or manual exam authoring.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("ai")}
          className={`py-3 px-6 font-bold text-sm border-b-2 flex items-center space-x-2 transition ${
            activeTab === "ai"
              ? "border-purple-600 text-purple-700 bg-purple-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>AI Practice Test Generator</span>
        </button>

        <button
          onClick={() => setActiveTab("manual")}
          className={`py-3 px-6 font-bold text-sm border-b-2 flex items-center space-x-2 transition ${
            activeTab === "manual"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Manual Mock Test Creator</span>
        </button>
      </div>

      {/* TAB 1: AI GENERATOR */}
      {activeTab === "ai" && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Gemini Book / Material Ingestion</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste raw study text; Gemini extracts pseudocode, MCQs, and logic questions.
              </p>
            </div>
            <button
              type="button"
              onClick={loadSampleText}
              className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition"
            >
              Load Sample Chapter Text
            </button>
          </div>

          <form onSubmit={handleGenerateAI} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Practice Test Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: Data Structures & Complexity"
                  value={aiExamTitle}
                  onChange={(e) => setAiExamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={aiDuration}
                  onChange={(e) => setAiDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Questions to Generate
                </label>
                <select
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                >
                  <option value={3}>3 Questions (Fast)</option>
                  <option value={5}>5 Questions (Recommended)</option>
                  <option value={10}>10 Questions (Comprehensive)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                  Question Format Balance
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Automatically blends Logic & Pseudocode tracing, Multiple Choice technical questions, and 1 Essay/Code query.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                Book Chapter / Study Material Content
              </label>
              <textarea
                rows={10}
                required
                placeholder="Paste technical documentation, book chapter notes, or syllabus content here..."
                value={aiTextContent}
                onChange={(e) => setAiTextContent(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-lg text-sm font-sans focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting & Inserting Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Save Practice Test</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Result Summary */}
          {aiResult && (
            <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-xl space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span>
                  Successfully generated and inserted {aiResult.count} questions into Supabase!
                </span>
              </div>
              <p className="text-xs text-purple-700">
                The practice assessment is now live and available on candidate dashboards.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/admin/exams/${aiResult.examId}`)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition"
                >
                  Review Questions
                </button>
                <button
                  onClick={() => router.push(`/student/exam/${aiResult.examId}`)}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-800 hover:bg-purple-100 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                >
                  Take Test in Student View
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL CREATOR */}
      {activeTab === "manual" && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              Manual Mock Test Setup
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define exam timing and metadata, then add questions with code blocks and options.
            </p>
          </div>

          <form onSubmit={handleCreateManual} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                Exam Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Infosys Placement Qualifier - Batch 2026"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Exam Type
                </label>
                <input
                  type="text"
                  disabled
                  value="Mock Test"
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                Description & Instructions
              </label>
              <textarea
                rows={4}
                placeholder="General instructions for candidates..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isCreatingManual}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-2"
              >
                {isCreatingManual ? (
                  <span>Creating Exam...</span>
                ) : (
                  <>
                    <span>Proceed to Add Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
