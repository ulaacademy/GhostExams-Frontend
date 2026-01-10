"use client";
import { useState } from "react";
import axios from "axios";

export default function AnalyzeExams() {
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [term, setTerm] = useState("");
  const [questions, setQuestions] = useState([{ type: "", tags: [] }]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    try {
      const response = await axios.post(
        "https://ge-api.ghostexams.com/api/ai/analyze",
        {
          subject,
          grade,
          term,
          questions,
        }
      );
      setMessage(response.data.message);
    } catch (err) {
      console.error("❌ فشل في تحليل الامتحانات:", err);
      setError("❌ فشل في تحليل الامتحانات. حاول مرة أخرى لاحقاً.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🔍 تحليل الامتحانات</h1>
      <input
        type="text"
        placeholder="المادة"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        type="text"
        placeholder="الصف"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
      />
      <input
        type="text"
        placeholder="الفصل"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />

      {questions.map((q, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="نوع السؤال"
            value={q.type}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].type = e.target.value;
              setQuestions(newQuestions);
            }}
          />
          <input
            type="text"
            placeholder="الكلمات المفتاحية"
            value={q.tags.join(", ")}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].tags = e.target.value
                .split(",")
                .map((tag) => tag.trim());
              setQuestions(newQuestions);
            }}
          />
        </div>
      ))}

      <button
        onClick={handleAnalyze}
        className="bg-blue-500 text-white px-4 py-2 mt-4"
      >
        تحليل الامتحانات
      </button>

      {message && <p className="mt-4 text-green-500">{message}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
