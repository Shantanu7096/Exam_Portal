import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedQuestionItem {
  question_text: string;
  type: "mcq" | "essay";
  options: string[];
  correct_answer: string;
  explanation?: string;
}

export async function generateQuestionsFromText(
  textContent: string,
  questionCount: number = 5
): Promise<GeneratedQuestionItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("Dummy") || apiKey === "") {
    // Return high quality mock questions if API key is not yet set
    const fallbackList: GeneratedQuestionItem[] = [
      {
        question_text: "What will be the output of the following pseudocode?\n\nInteger a = 5, b = 3\nInteger c = (a & b) + (a | b)\nPrint c",
        type: "mcq",
        options: ["8", "7", "6", "5"],
        correct_answer: "8",
        explanation: "(a & b) is 1, (a | b) is 7. 1 + 7 = 8.",
      },
      {
        question_text: "In asymptotic computational complexity, what is the tight upper bound of finding an element in a balanced Binary Search Tree (BST) of size N?",
        type: "mcq",
        options: ["O(log N)", "O(N)", "O(1)", "O(N log N)"],
        correct_answer: "O(log N)",
        explanation: "A balanced BST has a height of log2(N), leading to O(log N) lookup.",
      },
      {
        question_text: "Predict the output of the following C logic:\n\nint x = 10;\nint y = ++x + x++;\nprintf(\"%d\", y);",
        type: "mcq",
        options: ["22", "23", "21", "Undefined Behavior in C standard"],
        correct_answer: "Undefined Behavior in C standard",
        explanation: "Modifying a variable multiple times without a sequence point causes undefined behavior.",
      },
      {
        question_text: "Explain the ACID properties in relational database management systems and why isolation levels matter for high-concurrency transactions.",
        type: "essay",
        options: [],
        correct_answer: "Atomicity, Consistency, Isolation, Durability ensure reliable transaction processing even in the event of crashes or concurrent access.",
      },
      {
        question_text: "In a network packet header, which layer 4 protocol is connection-oriented and enforces 3-way handshake sequence acknowledgment?",
        type: "mcq",
        options: ["TCP", "UDP", "ICMP", "ARP"],
        correct_answer: "TCP",
        explanation: "Transmission Control Protocol (TCP) provides ordered, reliable delivery via 3-way handshakes (SYN, SYN-ACK, ACK).",
      },
    ];
    return fallbackList.slice(0, questionCount);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = `
You are an expert technical question curator for top-tier campus recruitment drives (TCS NQT, Infosys DSE, Cognizant, Wipro).
Generate ${questionCount} high quality questions based on the text provided below.

REQUIREMENTS:
1. Mix of Pseudocode / Logic Tracing questions (with clear indentation), Core Technical Aptitude, and 1 Essay / Code implementation question.
2. For MCQs (type: "mcq"), provide EXACTLY 4 options in an array.
3. For Essay / Code questions (type: "essay"), provide an empty options array [].
4. Set "correct_answer" to the exact string matching one of the options (for MCQ) or key model answer (for essay).
5. Output STRICT JSON as an array of objects matching this schema:
[
  {
    "question_text": "string (can contain code snippets with newlines)",
    "type": "mcq" | "essay",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "exact option string or model answer",
    "explanation": "concise explanation"
  }
]

STUDY MATERIAL:
${textContent}
`;

  const result = await model.generateContent(prompt);
  const textResponse = result.response.text();
  try {
    const cleaned = textResponse.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned) as GeneratedQuestionItem[];
  } catch (err) {
    console.error("Failed to parse Gemini JSON output:", textResponse, err);
    throw new Error("Invalid question format received from AI model");
  }
}
