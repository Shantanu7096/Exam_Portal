"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertTriangle,
  Maximize,
  ShieldAlert,
  Clock,
  User,
  Hash,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BookmarkCheck,
  Send,
} from "lucide-react";
import { Question, QuestionStatus, UserResponse } from "@/types/exam";

interface ExamUIProps {
  examId: string;
  userExamId: string;
  examTitle: string;
  candidateName: string;
  candidateRollNumber: string;
  initialTimeRemaining: number; // in seconds
  questions: Question[];
  initialResponses?: Record<string, UserResponse>;
  onSubmitExam: (finalResponses: Record<string, UserResponse>, reason?: string) => Promise<void>;
  onSyncProgress: (remainingTime: number, responses: Record<string, UserResponse>) => Promise<void>;
}

export default function ExamUI({
  examId,
  userExamId,
  examTitle,
  candidateName,
  candidateRollNumber,
  initialTimeRemaining,
  questions,
  initialResponses = {},
  onSubmitExam,
  onSyncProgress,
}: ExamUIProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [violationCount, setViolationCount] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(initialTimeRemaining);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize response state with localStorage fallback
  const [responses, setResponses] = useState<Record<string, UserResponse>>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(`exam_state_${userExamId}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error("Local storage parse error:", e);
        }
      }
    }

    const defaultMap: Record<string, UserResponse> = { ...initialResponses };
    questions.forEach((q, idx) => {
      if (!defaultMap[q.id]) {
        defaultMap[q.id] = {
          question_id: q.id,
          selected_answer: "",
          status: idx === 0 ? "visited_unanswered" : "not_visited",
        };
      }
    });
    return defaultMap;
  });

  const activeQuestion = questions[currentIndex] || questions[0];
  const activeResponse = responses[activeQuestion?.id];
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fullscreen Request
  const requestFullscreenLock = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Fullscreen request failed", err);
    }
  };

  // 2. Anti-cheat Security Listeners
  const handleSecurityInfraction = useCallback(
    (reason: string) => {
      if (isSubmitting) return;

      setViolationCount((prev) => {
        const nextCount = prev + 1;
        setWarningMessage(reason);
        if (nextCount >= 3) {
          setIsSubmitting(true);
          alert(`Disqualified! You have triggered 3 security infractions (${reason}). Your exam will now be submitted.`);
          onSubmitExam(responses, "Security Violations Exceeded");
        } else {
          setShowWarningModal(true);
        }
        return nextCount;
      });
    },
    [isSubmitting, responses, onSubmitExam]
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active && !isSubmitting) {
        handleSecurityInfraction("Exited full-screen environment");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isSubmitting) {
        handleSecurityInfraction("Tab switch or browser minimization detected");
      }
    };

    const handleWindowBlur = () => {
      if (!isSubmitting) {
        handleSecurityInfraction("Window focus lost or application switched");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [handleSecurityInfraction, isSubmitting]);

  // 3. Countdown Timer
  useEffect(() => {
    if (remainingTime <= 0 && !isSubmitting) {
      setIsSubmitting(true);
      alert("Exam time limit reached! Auto-submitting your test.");
      onSubmitExam(responses, "Time Limit Expired");
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, isSubmitting, responses, onSubmitExam]);

  // 4. Persistence & Sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`exam_state_${userExamId}`, JSON.stringify(responses));
    }
  }, [responses, userExamId]);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (!isSubmitting) {
        onSyncProgress(remainingTime, responses).catch(console.error);
      }
    }, 15000);

    return () => clearInterval(syncInterval);
  }, [remainingTime, responses, isSubmitting, onSyncProgress]);

  // Helper formatting mm:ss
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // User Actions
  const handleAnswerSelect = (val: string) => {
    setResponses((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        selected_answer: val,
      },
    }));
  };

  const handleClearResponse = () => {
    setResponses((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        selected_answer: "",
        status: "visited_unanswered",
      },
    }));
  };

  const handleSaveAndNext = () => {
    const hasAnswer = !!responses[activeQuestion.id]?.selected_answer?.trim();
    const newStatus: QuestionStatus = hasAnswer ? "answered" : "visited_unanswered";

    setResponses((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        status: newStatus,
      },
    }));

    navigateToQuestion(currentIndex + 1);
  };

  const handleMarkForReviewAndNext = () => {
    const hasAnswer = !!responses[activeQuestion.id]?.selected_answer?.trim();
    const newStatus: QuestionStatus = hasAnswer
      ? "answered_and_marked"
      : "marked_for_review";

    setResponses((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        status: newStatus,
      },
    }));

    navigateToQuestion(currentIndex + 1);
  };

  const navigateToQuestion = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < questions.length) {
      const nextQ = questions[targetIndex];
      setResponses((prev) => {
        if (prev[nextQ.id]?.status === "not_visited") {
          return {
            ...prev,
            [nextQ.id]: {
              ...prev[nextQ.id],
              status: "visited_unanswered",
            },
          };
        }
        return prev;
      });
      setCurrentIndex(targetIndex);
    }
  };

  // Palette button color styles
  const getBadgeStyle = (status: QuestionStatus) => {
    switch (status) {
      case "answered":
        return "bg-emerald-600 text-white border-emerald-600";
      case "visited_unanswered":
        return "bg-rose-600 text-white border-rose-600";
      case "marked_for_review":
        return "bg-purple-600 text-white border-purple-600";
      case "answered_and_marked":
        return "bg-purple-700 text-white border-purple-700 relative";
      case "not_visited":
      default:
        return "bg-gray-200 text-gray-700 border-gray-300";
    }
  };

  // If not in fullscreen, require button click to lock screen
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 select-none">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl text-white">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
            <Maximize className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight">
            Security Enforced Assessment Mode
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            This test operates under rigorous TCS iON / Infosys proctoring rules.
            You must lock your browser into full screen to access the exam.
            <br />
            <strong className="text-amber-400 block mt-2">
              Warning: Exiting full screen, switching browser tabs, or losing focus will log an infraction. 3 infractions result in automatic disqualification.
            </strong>
          </p>

          <button
            onClick={requestFullscreenLock}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
          >
            <Maximize className="w-4 h-4" />
            <span>Enter Fullscreen & Begin Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-medium">No questions found in this assessment.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col h-screen w-screen overflow-hidden select-none bg-slate-100 text-slate-900 font-sans"
    >
      {/* 1. TOP HEADER (TCS iON / Infosys layout) */}
      <header className="h-16 bg-[#273746] text-white flex items-center justify-between px-6 shadow-md border-b border-slate-700 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wider">
            iON TEST
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide truncate max-w-md">
              {examTitle}
            </h1>
            <p className="text-[11px] text-slate-300">
              Section 1: Quantitative Aptitude & Technical Coding
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[11px] text-slate-300 flex items-center space-x-1">
              <User className="w-3 h-3 inline" />
              <span>{candidateName}</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Roll: {candidateRollNumber}
            </span>
          </div>

          <div className="flex items-center bg-slate-900/80 px-4 py-1.5 rounded-lg border border-slate-700 space-x-2">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                Time Remaining
              </span>
              <span className="text-base font-mono font-bold text-amber-400">
                {formatTimer(remainingTime)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY (Split View: Left Question / Right Palette) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT WORKSPACE: QUESTION & INPUT */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-300">
          {/* Sub Header for Question Index and Marks */}
          <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-6 shrink-0">
            <div className="text-sm font-bold text-slate-800">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +{activeQuestion.marks} Mark
              </span>
              {activeQuestion.negative_marks > 0 && (
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  -{activeQuestion.negative_marks} Neg
                </span>
              )}
            </div>
          </div>

          {/* Question Text & Options Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="prose max-w-none text-slate-900 mb-6 font-medium text-base whitespace-pre-wrap leading-relaxed">
              {activeQuestion.question_text}
            </div>

            {/* MCQ Options */}
            {activeQuestion.type === "mcq" && activeQuestion.options_json && (
              <div className="space-y-3 mt-4">
                {activeQuestion.options_json.map((option, idx) => {
                  const isSelected = activeResponse?.selected_answer === option;
                  return (
                    <label
                      key={idx}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 shadow-sm"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${activeQuestion.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(option)}
                        className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-slate-800 font-normal leading-normal">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Essay / Pseudocode Input */}
            {activeQuestion.type === "essay" && (
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Code / Detailed Answer Input:
                </label>
                <textarea
                  rows={9}
                  value={activeResponse?.selected_answer || ""}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder="Write your explanation or code solution here..."
                  className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50"
                />
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS BAR (Infosys / TCS Style) */}
          <footer className="h-16 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="px-4 py-2 border border-purple-600 text-purple-700 hover:bg-purple-50 rounded text-xs font-semibold uppercase tracking-wider transition flex items-center space-x-1.5"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Mark for Review & Next</span>
              </button>
              <button
                type="button"
                onClick={handleClearResponse}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold uppercase tracking-wider transition flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Response</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold uppercase tracking-wider shadow transition flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save & Next</span>
              </button>
            </div>
          </footer>
        </main>

        {/* RIGHT PANEL: QUESTION PALETTE */}
        <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0">
          {/* Palette Legend */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Question Palette Legend
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ✗
                </span>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-gray-200 text-slate-700 border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                  -
                </span>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ★
                </span>
                <span>Review</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <span className="relative w-5 h-5 rounded bg-purple-700 text-white flex items-center justify-center font-bold text-[10px]">
                  ★
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-white rounded-full"></span>
                </span>
                <span>Answered & Review</span>
              </div>
            </div>
          </div>

          {/* Palette Question Buttons Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
              Question Palette ({questions.length})
            </h4>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const qResp = responses[q.id];
                const status: QuestionStatus = qResp?.status || "not_visited";
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigateToQuestion(idx)}
                    className={`h-9 w-9 rounded-md font-bold text-xs flex items-center justify-center transition border ${getBadgeStyle(
                      status
                    )} ${
                      isCurrent
                        ? "ring-2 ring-offset-2 ring-blue-600 scale-105 shadow-md"
                        : "hover:opacity-90"
                    }`}
                  >
                    {idx + 1}
                    {status === "answered_and_marked" && (
                      <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Final Submit Section */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to finalize and submit the exam? You will not be able to change your answers."
                  )
                ) {
                  setIsSubmitting(true);
                  onSubmitExam(responses, "Student Requested Final Submit");
                }
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-lg shadow transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit Assessment"}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 3. VIOLATION MODAL DIALOG */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-500 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Security Infraction Detected
            </h3>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-2">
              Warning {violationCount} of 3
            </p>
            <p className="text-xs text-slate-600 mb-4 bg-slate-100 p-2.5 rounded font-mono">
              {warningMessage || "Unauthorized window blur or fullscreen exit"}
            </p>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Leaving the full-screen view, opening developer tools, or switching to
              another tab is strictly logged. On the 3rd infraction, your assessment will be
              automatically terminated with a disqualification mark.
            </p>
            <button
              onClick={() => {
                setShowWarningModal(false);
                requestFullscreenLock();
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow"
            >
              I Understand & Resume Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
