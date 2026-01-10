"use client";
import { useState } from "react";
import { createTeacherExam } from "@/services/api";
import { showSuccess } from "@/utils/toastHelper";

export default function CreateCustomExam() {
  const [examName, setExamName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [term, setTerm] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ تحويل الأسئلة إلى الصيغة المتوقعة من الخادم
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));

      const response = await createTeacherExam({
        examName,
        subject,
        grade,
        term,
        duration,
        questions: formattedQuestions,
      });

      if (response && (response.status === 201 || response.exam)) {
        showSuccess("تم إنشاء الامتحان بنجاح");
        setExamName("");
        setSubject("");
        setGrade("");
        setTerm("");
        setDuration(30);
        setQuestions([
          { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
        ]);
      } else {
        // Error is already handled by axios interceptor (Toast shown)
      }
    } catch (error) {
      // Error is already handled by axios interceptor (Toast shown)
      console.error("❌ خطأ أثناء إرسال البيانات:", error);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        ✍️ إنشاء امتحان جديد للطلاب
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">📌 عنوان الامتحان</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">📚 المادة</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="مثال: الرياضيات"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">🎓 الصف</label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="مثال: الأول الثانوي"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">📅 الفصل الدراسي</label>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="مثال: الفصل الأول"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">
            ⏱️ مدة الامتحان (بالدقائق)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={index}
              className="border p-4 rounded bg-gray-100 shadow-sm"
            >
              <label className="block font-semibold mb-2">
                ❓ السؤال {index + 1}
              </label>
              <input
                type="text"
                value={q.questionText}
                onChange={(e) =>
                  handleQuestionChange(index, "questionText", e.target.value)
                }
                className="w-full border p-2 mb-3 rounded"
                required
              />

              {q.options.map((opt, oIndex) => (
                <input
                  key={oIndex}
                  type="text"
                  placeholder={`الخيار ${oIndex + 1}`}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(index, oIndex, e.target.value)
                  }
                  className="w-full border p-2 mb-2 rounded"
                  required
                />
              ))}

              <input
                type="text"
                placeholder="الإجابة الصحيحة"
                value={q.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(index, "correctAnswer", e.target.value)
                }
                className="w-full border p-2 mt-3 rounded"
                required
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addNewQuestion}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            ➕ أضف سؤال جديد
          </button>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700"
        >
          ✅ إنشاء الامتحان
        </button>
      </form>
    </div>
  );
}
