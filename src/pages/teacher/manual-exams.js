"use client";
// ✅ الخطوة التالية: واجهة المعلم لإدخال امتحان يدوي جديد
// الموقع: frontend/src/pages/teacher/manual-exams.js

import { useState } from "react";
import axios from "axios";
import { showSuccess } from "@/utils/toastHelper";

export default function ManualExamCreatePage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [term, setTerm] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);

  const teacherId = "PUT_TEACHER_ID_HERE"; // ⚠️ استبدلها لاحقًا بـ useContext أو useSession

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "options") {
      updated[index].options = value;
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/teacher-manual-exams/create", {
        teacherId,
        title,
        subject,
        grade,
        term,
        duration,
        questions,
      });
      showSuccess("تم إنشاء الامتحان بنجاح");
      console.log(response.data);
    } catch (error) {
      // Error is already handled by axios interceptor (Toast shown)
      console.error("❌ فشل في إنشاء الامتحان", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📘 إنشاء امتحان يدوي</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="عنوان الامتحان"
          className="border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="المادة"
          className="border p-2 rounded"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="الصف"
          className="border p-2 rounded"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <input
          type="text"
          placeholder="الفصل الدراسي"
          className="border p-2 rounded"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="المدة بالدقائق"
          className="border p-2 rounded"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2">الأسئلة:</h2>
      {questions.map((q, i) => (
        <div key={i} className="border rounded p-4 mb-4">
          <input
            type="text"
            placeholder={`السؤال ${i + 1}`}
            className="border p-2 w-full mb-2"
            value={q.questionText}
            onChange={(e) => handleQuestionChange(i, "questionText", e.target.value)}
          />
          {q.options.map((opt, j) => (
            <input
              key={j}
              type="text"
              placeholder={`الخيار ${j + 1}`}
              className="border p-2 w-full mb-1"
              value={opt}
              onChange={(e) => {
                const newOptions = [...q.options];
                newOptions[j] = e.target.value;
                handleQuestionChange(i, "options", newOptions);
              }}
            />
          ))}
          <input
            type="text"
            placeholder="الإجابة الصحيحة"
            className="border p-2 w-full"
            value={q.correctAnswer}
            onChange={(e) => handleQuestionChange(i, "correctAnswer", e.target.value)}
          />
        </div>
      ))}

      <button
        className="bg-gray-600 text-white px-4 py-2 rounded mr-2"
        onClick={addQuestion}
      >
        ➕ أضف سؤال
      </button>

      <button
        className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
        onClick={handleSubmit}
      >
        🚀 إنشاء الامتحان
      </button>
    </div>
  );
}
