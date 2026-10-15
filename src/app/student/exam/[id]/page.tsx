"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExamUI from "@/components/exam/ExamUI";
import { Question, UserResponse } from "@/types/exam";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StudentLiveExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<{
    id: string;
    title: string;
    duration: number;
    questions: Question[];
    userExamId: string;
    remainingTime: number;
    candidateName: string;
    candidateRollNumber: string;
    initialResponses: Record<string, UserResponse>;
  } | null>(null);

  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  useEffect(() => {
    async function initExam() {
      try {
        setLoading(true);
        // Call endpoint or load exam details
        const res = await fetch(`/api/exam/${examId}/start`, {
          method: "POST",
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load exam");
        }

        const data = await res.json();
        setExamData(data);
      } catch (err: any) {
        console.error("Exam init error:", err);
        setError(err.message || "An unexpected error occurred while starting the exam.");
      } finally {
        setLoading(false);
      }
    }

    if (examId) {
      initExam();
    }
  }, [examId]);

  const handleSubmitExam = async (
    responses: Record<string, UserResponse>,
    reason?: string
  ) => {
    if (!examData) return;

    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userExamId: examData.userExamId,
          examId: examData.id,
          responses,
          reason,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        // Clear cached local storage
        localStorage.removeItem(`exam_state_${examData.userExamId}`);
        // Immediately navigate to the detailed results scorecard & review
        router.push(`/student/results/${examData.userExamId}`);
      } else {
        alert(result.error || "Failed to submit exam.");
      }
    } catch (e: any) {
      alert("Submission error: " + e.message);
    }
  };

  const handleSyncProgress = async (
    remainingTime: number,
    responses: Record<string, UserResponse>
  ) => {
    if (!examData) return;

    await fetch("/api/exam/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userExamId: examData.userExamId,
        remainingTime,
        responses,
      }),
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Configuring Secure Assessment Session</h2>
        <p className="text-sm text-slate-400 mt-2">
          Syncing questions, candidate profile, and timer from database...
        </p>
      </div>
    );
  }

  if (submissionResult) {
    const isDisqualified = submissionResult.status === "disqualified";
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-white shadow-2xl">
          {isDisqualified ? (
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2">
            {isDisqualified ? "Assessment Terminated" : "Assessment Completed"}
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            {isDisqualified
              ? "Your session was ended due to excessive security infractions."
              : "Your responses have been successfully submitted and evaluated."}
          </p>

          <div className="bg-slate-800/80 rounded-lg p-4 mb-6 border border-slate-700/60 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span
                className={`font-semibold capitalize ${
                  isDisqualified ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {submissionResult.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Score Obtained:</span>
              <span className="font-semibold text-white">
                {submissionResult.score} / {submissionResult.totalMarks}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Percentage:</span>
              <span className="font-semibold text-blue-400">
                {submissionResult.percentage}%
              </span>
            </div>
            {submissionResult.reason && (
              <div className="flex justify-between text-xs pt-1 border-t border-slate-700">
                <span className="text-slate-500">Notice:</span>
                <span className="text-slate-300">{submissionResult.reason}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link
              href={`/student/results/${examData?.userExamId || examId}`}
              className="w-full inline-block py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition text-sm uppercase tracking-wider"
            >
              View Detailed Scorecard & Answers
            </Link>
            <Link
              href="/student/dashboard"
              className="w-full inline-block py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition text-xs uppercase tracking-wider border border-slate-700"
            >
              Back to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800 border border-rose-500/30 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to Start Assessment</h2>
          <p className="text-sm text-slate-300 mb-6">{error}</p>
          <Link
            href="/student/dashboard"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ExamUI
      examId={examData.id}
      userExamId={examData.userExamId}
      examTitle={examData.title}
      candidateName={examData.candidateName}
      candidateRollNumber={examData.candidateRollNumber}
      initialTimeRemaining={examData.remainingTime}
      questions={examData.questions}
      initialResponses={examData.initialResponses}
      onSubmitExam={handleSubmitExam}
      onSyncProgress={handleSyncProgress}
    />
  );
}
