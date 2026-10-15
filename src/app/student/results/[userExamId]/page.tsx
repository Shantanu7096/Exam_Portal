"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  Award,
  BarChart3,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

export default function StudentExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const userExamId = params?.userExamId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        const res = await fetch(`/api/exam/results/${userExamId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (userExamId) fetchResults();
  }, [userExamId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
        Loading assessment scorecard and question analysis...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-slate-500">
        Assessment results could not be found.
      </div>
    );
  }

  const { userExam, questions, totalMarks, correctCount, incorrectCount, unattemptedCount } = data;
  const isDisqualified = userExam.status === "disqualified";
  const percentage = totalMarks > 0 ? ((userExam.score / totalMarks) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Return to Assessments</span>
        </Link>
      </div>

      {/* Main Score Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                  isDisqualified
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {isDisqualified ? "Disqualified" : "Completed"}
              </span>
              <span className="text-xs text-slate-400">
                Attempt #{userExam.attempts_used || 1}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {userExam.exams?.title || "Placement Assessment"}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              Score Obtained
            </span>
            <div className="text-4xl font-black text-blue-600 mt-1">
              {userExam.score}{" "}
              <span className="text-xl text-slate-400 font-medium">/ {totalMarks}</span>
            </div>
          </div>
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Percentage</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{percentage}%</div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 font-semibold uppercase">Correct</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">{correctCount}</div>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
            <span className="text-[11px] text-rose-700 font-semibold uppercase">Incorrect</span>
            <div className="text-xl font-bold text-rose-700 mt-1">{incorrectCount}</div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <span className="text-[11px] text-amber-700 font-semibold uppercase">Unattempted</span>
            <div className="text-xl font-bold text-amber-700 mt-1">{unattemptedCount}</div>
          </div>
        </div>

        {userExam.violation_count > 0 && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-800 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              Proctoring Audit: Candidate logged {userExam.violation_count} security
              infraction(s) during this assessment.
            </span>
          </div>
        )}
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Question-by-Question Review</span>
        </h2>

        {questions.map((q: any, idx: number) => {
          const userAns = q.userResponse?.selected_answer;
          const isCorrect = q.isCorrect;
          const isUnattempted = !userAns;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-xl border p-6 shadow-sm transition ${
                isUnattempted
                  ? "border-slate-200"
                  : isCorrect
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-rose-200 bg-rose-50/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Type: {q.type}
                  </span>
                </div>

                <div>
                  {isUnattempted ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Unattempted (0 Marks)
                    </span>
                  ) : isCorrect ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Correct (+{q.marks} Mark)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Incorrect (-{q.negative_marks} Neg)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm font-medium text-slate-900 whitespace-pre-wrap leading-relaxed mb-4">
                {q.question_text}
              </div>

              {/* MCQ Options Display */}
              {q.type === "mcq" && q.options_json && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                  {q.options_json.map((opt: string, oIdx: number) => {
                    const isSelected = userAns === opt;
                    const isTargetCorrect =
                      opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

                    let optionClass = "bg-slate-50 border-slate-200 text-slate-700";
                    if (isTargetCorrect) {
                      optionClass = "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold";
                    } else if (isSelected && !isCorrect) {
                      optionClass = "bg-rose-100 border-rose-300 text-rose-900 font-semibold line-through";
                    }

                    return (
                      <div key={oIdx} className={`p-3 rounded-lg border ${optionClass}`}>
                        {opt} {isTargetCorrect && " ✓ (Correct Answer)"}{" "}
                        {isSelected && !isTargetCorrect && " ✗ (Your Answer)"}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "mcq" && !isCorrect && (
                <div className="mt-2.5 p-2.5 bg-slate-100 rounded text-xs text-slate-700 flex items-center justify-between border border-slate-200">
                  <span>
                    <strong className="text-emerald-700">Correct Option:</strong> {q.correct_answer}
                  </span>
                  {q.negative_marks > 0 && !isUnattempted && (
                    <span className="text-rose-600 font-semibold text-[11px]">Penalty deducted: -{q.negative_marks}</span>
                  )}
                </div>
              )}

              {/* Essay Answers */}
              {q.type === "essay" && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-100 rounded border border-slate-200">
                    <span className="font-bold text-slate-600 block mb-1">Your Submitted Response:</span>
                    <pre className="whitespace-pre-wrap font-mono text-slate-800">
                      {userAns || "No response submitted."}
                    </pre>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200 text-blue-900">
                    <span className="font-bold block mb-1">Model Evaluation Benchmark:</span>
                    <p>{q.correct_answer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
