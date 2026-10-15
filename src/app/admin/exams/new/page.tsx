"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight,
  BookOpen,
  UploadCloud,
  FileUp,
  File,
  X,
  FileCheck,
  Calendar,
  Clock,
  Shield,
  Layers,
} from "lucide-react";

function NewExamPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");

  // Scheduling State (Common for both AI and Manual)
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");

  // AI Generator Form State
  const [aiExamTitle, setAiExamTitle] = useState("");
  const [aiDuration, setAiDuration] = useState(30);
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiTextContent, setAiTextContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Uploaded Document State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available Study Materials from Library
  const [materialsList, setMaterialsList] = useState<any[]>([]);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualDuration, setManualDuration] = useState(45);
  const [manualDescription, setManualDescription] = useState("");
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Load materials list on mount
  useEffect(() => {
    async function loadMaterials() {
      try {
        const res = await fetch("/api/admin/materials");
        if (res.ok) {
          const data = await res.json();
          setMaterialsList(data.materials || []);
        }
      } catch (err) {
        console.error("Failed to load materials in exam generator:", err);
      }
    }
    loadMaterials();

    // Check if query params provided material
    const matName = searchParams.get("materialName");
    if (matName) {
      setUploadedFileName(matName);
      setAiExamTitle(`${matName.replace(/\.[^/.]+$/, "")} Assessment`);
      loadSampleText(); // fallback content
    }
  }, [searchParams]);

  // Handle Document / Reference Book File Upload
  const handleFileUpload = (file: File) => {
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(1) + " KB");

    // Auto set test title from file name if blank
    if (!aiExamTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setAiExamTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + " Practice Test");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setAiTextContent(text);
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFileName(null);
    setUploadedFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Sample study text button for quick testing
  const loadSampleText = () => {
    setAiExamTitle("TCS NQT Dynamic Programming & Sorting Practice");
    setUploadedFileName("Algorithm_Notes_Chapter_4.txt");
    setUploadedFileSize("12.4 KB");
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
      alert("Please upload a reference book/notes file or paste study material text.");
      return;
    }

    if (isScheduled && (!scheduleStartTime || !scheduleEndTime)) {
      alert("Please specify both Start Date/Time and End Date/Time for the scheduled exam.");
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
          isScheduled,
          startTime: isScheduled ? new Date(scheduleStartTime).toISOString() : null,
          endTime: isScheduled ? new Date(scheduleEndTime).toISOString() : null,
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

    if (isScheduled && (!scheduleStartTime || !scheduleEndTime)) {
      alert("Please specify both Start Date/Time and End Date/Time for the scheduled exam.");
      return;
    }

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
          isScheduled,
          startTime: isScheduled ? new Date(scheduleStartTime).toISOString() : null,
          endTime: isScheduled ? new Date(scheduleEndTime).toISOString() : null,
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
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create New Assessment
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload reference books and study materials for AI test generation, or schedule a mock exam with custom time windows.
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
          <span>AI Practice Test & Book Ingestion</span>
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

      {/* SCHEDULING CARD (Common for both) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4 text-slate-800 font-bold text-sm">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Exam Availability & Scheduling Window</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <label
            onClick={() => setIsScheduled(false)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
              !isScheduled
                ? "border-blue-600 bg-blue-50/40 text-blue-900"
                : "border-slate-200 hover:border-slate-300 text-slate-700"
            }`}
          >
            <input
              type="radio"
              name="scheduleType"
              checked={!isScheduled}
              onChange={() => setIsScheduled(false)}
              className="mt-1"
            />
            <div>
              <p className="font-bold text-sm">On-Demand Practice Mock</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Available 24/7 for candidates to attempt whenever they want.
              </p>
            </div>
          </label>

          <label
            onClick={() => setIsScheduled(true)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
              isScheduled
                ? "border-blue-600 bg-blue-50/40 text-blue-900"
                : "border-slate-200 hover:border-slate-300 text-slate-700"
            }`}
          >
            <input
              type="radio"
              name="scheduleType"
              checked={isScheduled}
              onChange={() => setIsScheduled(true)}
              className="mt-1"
            />
            <div>
              <p className="font-bold text-sm">Scheduled Fixed Window</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Restricted to a designated date & time range (e.g. university exam).
              </p>
            </div>
          </label>
        </div>

        {isScheduled && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Exam Window Start Time
              </label>
              <input
                type="datetime-local"
                required={isScheduled}
                value={scheduleStartTime}
                onChange={(e) => setScheduleStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Candidates cannot launch test before this time.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Exam Window End Time
              </label>
              <input
                type="datetime-local"
                required={isScheduled}
                value={scheduleEndTime}
                onChange={(e) => setScheduleEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Submissions lock automatically after this time.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: AI GENERATOR & BOOK UPLOAD */}
      {activeTab === "ai" && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Upload Study Materials & Reference Books</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload chapter PDFs, textbooks, notes, or select from your uploaded library.
              </p>
            </div>
            <button
              type="button"
              onClick={loadSampleText}
              className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition"
            >
              Load Sample Chapter
            </button>
          </div>

          {/* Quick Select from Uploaded Library */}
          {materialsList.length > 0 && (
            <div className="mb-6 p-4 bg-purple-50/60 border border-purple-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block mb-2">
                Quick Ingest from Uploaded Library
              </span>
              <div className="flex flex-wrap gap-2">
                {materialsList.slice(0, 5).map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => {
                      setUploadedFileName(mat.name);
                      setAiExamTitle(`${mat.name.replace(/\.[^/.]+$/, "")} Assessment`);
                      loadSampleText();
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-purple-300 hover:border-purple-600 rounded-lg text-xs font-medium text-purple-800 transition shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>{mat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateAI} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS NQT Quantitative Ability Chapter 3"
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

            {/* Document Upload Zone */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                Attach Notes or Reference Book
              </label>

              {uploadedFileName ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{uploadedFileName}</p>
                      <p className="text-xs text-purple-700">{uploadedFileSize} &bull; Document attached for AI parsing</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearUploadedFile}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition bg-slate-50 hover:bg-purple-50/20"
                >
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    Click to browse or drag and drop reference book / notes
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports .txt, .md, .doc, syllabus sheets, and code files
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Study Content / Chapter Text
                </label>
                <span className="text-[11px] text-slate-400">
                  {aiTextContent.length} Characters
                </span>
              </div>
              <textarea
                rows={6}
                required
                placeholder="Paste reference text or syllabus notes directly here..."
                value={aiTextContent}
                onChange={(e) => setAiTextContent(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
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
                    <span>Extracting & Curating Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Save Assessment</span>
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
                {isScheduled
                  ? `This exam is scheduled from ${new Date(scheduleStartTime).toLocaleString()} to ${new Date(scheduleEndTime).toLocaleString()}.`
                  : "The practice assessment is now live on candidate dashboards."}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/admin/exams/${aiResult.examId}`)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition"
                >
                  Review Questions
                </button>
                <button
                  onClick={() => router.push(`/exam/${aiResult.examId}`)}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-800 hover:bg-purple-100 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                >
                  Test Student View
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
              Define exam title, timing window, and instructions, then author questions.
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
                  value={isScheduled ? "Scheduled Mock Test" : "On-Demand Mock Test"}
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold"
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

export default function NewExamPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <span>Loading exam configuration...</span>
        </div>
      }
    >
      <NewExamPageContent />
    </Suspense>
  );
}
