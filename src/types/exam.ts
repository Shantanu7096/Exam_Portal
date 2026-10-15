export type UserRole = "admin" | "student";
export type ExamType = "mock" | "practice";
export type QuestionType = "mcq" | "essay";
export type ExamStatus = "not_started" | "in_progress" | "completed" | "disqualified";
export type ResponseStatus =
  | "not_visited"
  | "visited_unanswered"
  | "answered"
  | "marked_for_review"
  | "answered_and_marked";

export type QuestionStatus = ResponseStatus;

export interface UserResponse {
  question_id: string;
  selected_answer: string;
  status: ResponseStatus;
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  allowed_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  total_questions: number;
  is_active: boolean;
  type: ExamType;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_order: number;
  question_text: string;
  options_json: string[] | null;
  correct_answer: string;
  type: QuestionType;
  marks: number;
  negative_marks: number;
  created_at?: string;
}

export interface UserExam {
  id: string;
  user_id: string;
  exam_id: string;
  status: ExamStatus;
  score: number | null;
  remaining_time: number; // in seconds
  attempts_used: number;
  violation_count: number;
  started_at: string;
  completed_at: string | null;
  exams?: Exam;
}

export interface ExamResponse {
  id?: string;
  user_exam_id: string;
  question_id: string;
  selected_answer: string | null;
  status: ResponseStatus;
  updated_at?: string;
}
