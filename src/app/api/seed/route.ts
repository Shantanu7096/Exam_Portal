import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // 1. Create TCS NQT Mock Test
    const { data: tcsExam, error: examErr1 } = await supabase
      .from("exams")
      .insert({
        title: "TCS iON National Qualifier Test (NQT) - Mock Exam 1",
        description: "Official pattern test covering Numerical Ability, Reasoning Logic, Pseudocode, and C/C++ Concepts.",
        duration: 45,
        total_questions: 6,
        is_active: true,
        type: "mock",
      })
      .select()
      .single();

    if (examErr1) {
      return NextResponse.json({ error: examErr1.message }, { status: 500 });
    }

    // 2. Insert TCS Questions
    const tcsQuestions = [
      {
        exam_id: tcsExam.id,
        question_order: 1,
        question_text: "What will be the output of the following pseudocode snippet?\n\nInteger a = 12, b = 25\nInteger c = (a & b) + (a | b) + (a ^ b)\nPrint c",
        type: "mcq",
        options_json: ["58", "62", "66", "70"],
        correct_answer: "66",
        marks: 1,
        negative_marks: 0.25,
      },
      {
        exam_id: tcsExam.id,
        question_order: 2,
        question_text: "Consider the following recursive function:\n\nint func(int n) {\n    if (n <= 1) return 1;\n    return func(n - 1) + func(n - 2);\n}\n\nWhat is the time complexity of this naive implementation?",
        type: "mcq",
        options_json: ["O(N)", "O(N log N)", "O(2^N)", "O(N^2)"],
        correct_answer: "O(2^N)",
        marks: 1,
        negative_marks: 0.25,
      },
      {
        exam_id: tcsExam.id,
        question_order: 3,
        question_text: "In C programming, what will be printed by the following code?\n\n#include <stdio.h>\nint main() {\n    int a = 5;\n    printf(\"%d %d %d\", a++, ++a, a);\n    return 0;\n}",
        type: "mcq",
        options_json: ["5 7 7", "6 7 7", "7 7 7", "Undefined behavior across compilers"],
        correct_answer: "Undefined behavior across compilers",
        marks: 1,
        negative_marks: 0.25,
      },
      {
        exam_id: tcsExam.id,
        question_order: 4,
        question_text: "Which of the following database isolation levels prevents 'Dirty Reads' but allows 'Non-Repeatable Reads'?",
        type: "mcq",
        options_json: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
        correct_answer: "Read Committed",
        marks: 1,
        negative_marks: 0.25,
      },
      {
        exam_id: tcsExam.id,
        question_order: 5,
        question_text: "In a network using TCP/IP, what is the size of the standard minimum TCP header without any options enabled?",
        type: "mcq",
        options_json: ["16 bytes", "20 bytes", "24 bytes", "32 bytes"],
        correct_answer: "20 bytes",
        marks: 1,
        negative_marks: 0.25,
      },
      {
        exam_id: tcsExam.id,
        question_order: 6,
        question_text: "Write pseudocode or explain Floyd's Tortoise and Hare algorithm for cycle detection in a linked list. Specify time and auxiliary space complexity.",
        type: "essay",
        options_json: null,
        correct_answer: "Traverse with slow (1 step) and fast (2 steps) pointers. If fast meets slow, a cycle exists. O(N) time and O(1) space.",
        marks: 5,
        negative_marks: 0.0,
      },
    ];

    await supabase.from("questions").insert(tcsQuestions);

    // 3. Create Infosys DSE Assessment
    const { data: infoExam } = await supabase
      .from("exams")
      .insert({
        title: "Infosys Specialist Programmer (DSE) - Data Structures & Algorithms",
        description: "Advanced assessment focusing on Graph Theory, Dynamic Programming, and Bit Manipulation.",
        duration: 60,
        total_questions: 4,
        is_active: true,
        type: "practice",
      })
      .select()
      .single();

    if (infoExam) {
      const infoQuestions = [
        {
          exam_id: infoExam.id,
          question_order: 1,
          question_text: "Given a weighted directed graph with non-negative edge weights, which algorithm finds single-source shortest paths in O((V + E) log V) using a min-heap?",
          type: "mcq",
          options_json: ["Bellman-Ford Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"],
          correct_answer: "Dijkstra's Algorithm",
          marks: 2,
          negative_marks: 0.5,
        },
        {
          exam_id: infoExam.id,
          question_order: 2,
          question_text: "What is the result of evaluating the bitwise expression: `(x & (x - 1))` when `x` is any positive non-zero integer?",
          type: "mcq",
          options_json: [
            "Clears the lowest set bit in x",
            "Sets the highest bit in x",
            "Inverts all bits of x",
            "Multiplies x by 2"
          ],
          correct_answer: "Clears the lowest set bit in x",
          marks: 2,
          negative_marks: 0.5,
        },
        {
          exam_id: infoExam.id,
          question_order: 3,
          question_text: "In Dynamic Programming, what distinguishes the Longest Common Subsequence (LCS) problem from the Longest Common Substring problem?",
          type: "mcq",
          options_json: [
            "Subsequence does not require contiguous characters, whereas substring requires contiguity",
            "Substring does not require contiguous characters",
            "LCS has exponential time complexity O(2^N) while substring is O(N)",
            "They are identical problems"
          ],
          correct_answer: "Subsequence does not require contiguous characters, whereas substring requires contiguity",
          marks: 2,
          negative_marks: 0.5,
        },
        {
          exam_id: infoExam.id,
          question_order: 4,
          question_text: "Explain how to implement an LRU (Least Recently Used) Cache with O(1) time complexity for both `get` and `put` operations. Detail the underlying data structures.",
          type: "essay",
          options_json: null,
          correct_answer: "Combination of a Hash Map and a Doubly Linked List. The hash map maps keys to node pointers, and the doubly linked list maintains the usage order.",
          marks: 6,
          negative_marks: 0.0,
        },
      ];

      await supabase.from("questions").insert(infoQuestions);
    }

    return NextResponse.json({
      success: true,
      message: "Seeded initial TCS NQT and Infosys mock tests into Supabase!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
