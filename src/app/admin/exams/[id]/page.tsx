"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Code,
  FileText,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Play,
  HelpCircle,
} from "lucide-react";
import { Question } from "@/types/exam";

export default function ExamQuestionEditorPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New question form state
  const [qType, setQType] = useState<"mcq" | "essay">("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [isAdding, setIsAdding] = useState(false);

  const fetchExamAndQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/exams/${examId}/questions`);
      if (res.ok) {
        const data = await res.json();
        setExam(data.exam);
        setQuestions(data.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) fetchExamAndQuestions();
  }, [examId]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    if (qType === "mcq") {
      if (options.some((opt) => !opt.trim())) {
        alert("Please provide all 4 options for MCQ.");
        return;
      }
      if (!correctAnswer.trim()) {
        alert("Please specify the correct answer matching one of the options.");
        return;
      }
    }

    try {
      setIsAdding(true);
      const res = await fetch(`/api/admin/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText,
          type: qType,
          options: qType === "mcq" ? options : null,
          correctAnswer,
          marks,
          negativeMarks: qType === "mcq" ? negativeMarks : 0,
        }),
      });

      if (res.ok) {
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        fetchExamAndQuestions();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add question");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(
        `/api/admin/exams/${examId}/questions?questionId=${questionId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading exam questions...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/exams"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">{exam?.title}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                {exam?.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Duration: {exam?.duration} mins • Total Questions: {questions.length}
            </p>
          </div>
        </div>

        <Link
          href={`/student/exam/${examId}`}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition flex items-center space-x-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Launch Live Simulator</span>
        </Link>
      </div>

      {/* Main Grid: Left Questions List, Right Add Question Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Existing Questions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Exam Questions ({questions.length})
            </h2>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
              No questions in this exam yet. Use the form on the right to manually add
              MCQs, pseudocode, or essay questions.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Type: {q.type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-emerald-600">
                      +{q.marks} / -{q.negative_marks}
                    </span>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-900 font-medium whitespace-pre-wrap leading-relaxed mb-4">
                  {q.question_text}
                </div>

                {q.type === "mcq" && q.options_json && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options_json.map((opt, oIdx) => {
                      const isCorrect =
                        opt.trim().toLowerCase() ===
                        q.correct_answer.trim().toLowerCase();
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded border ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          {opt} {isCorrect && "✓ (Correct)"}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "essay" && (
                  <div className="text-xs bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900">
                    <strong>Model / Benchmark Key:</strong> {q.correct_answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Question Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add Question</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Write rich pseudocode, multiple options, or essay questions.
            </p>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Question Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQType("mcq")}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      qType === "mcq"
                        ? "bg-blue-50 border-blue-600 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Multiple Choice (MCQ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQType("essay")}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      qType === "essay"
                        ? "bg-blue-50 border-blue-600 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Essay / Code Input
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Question Text & Pseudocode
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter problem statement or paste code snippet..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>

              {qType === "mcq" && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-600">
                    4 Options
                  </label>
                  {options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...options];
                        copy[i] = e.target.value;
                        setOptions(copy);
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  {qType === "mcq"
                    ? "Correct Answer (Must match an option exactly)"
                    : "Key / Evaluation Criteria"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    qType === "mcq"
                      ? "Paste exact correct option string"
                      : "Core expected concepts or solution"
                  }
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                {qType === "mcq" && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Negative Marks
                    </label>
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      value={negativeMarks}
                      onChange={(e) => setNegativeMarks(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition mt-2"
              >
                {isAdding ? "Saving Question..." : "Add Question to Exam"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
