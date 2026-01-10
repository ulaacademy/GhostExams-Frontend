"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { createTeacherExam } from "@/services/api"; // تأكد من وجودها في api.js
import { showSuccess, showWarning } from "@/utils/toastHelper";

export default function CreateTeacherExamPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    teacherId: "", // ضع القيمة الفعلية لاحقًا عند تسجيل الدخول
    examName: "",
    subject: "",
    grade: "",
    term: "",
    duration: 30,
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  const handleAddQuestion = () => {
    if (
      !currentQuestion.questionText ||
      !currentQuestion.correctAnswer ||
      currentQuestion.options.some((opt) => !opt)
    ) {
      showWarning("يرجى ملء جميع الحقول في السؤال");
      return;
    }

    setForm({
      ...form,
      questions: [...form.questions, currentQuestion],
    });

    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  const handleSubmit = async () => {
    try {
      // مؤقتًا: ضع معرف المعلم يدويًا أو اجلبه من السياق لاحقًا
      const payload = { ...form, teacherId: "65f1b9f9e2e2300f55b2c401" };
      await createTeacherExam(payload);
      showSuccess("تم إنشاء الامتحان بنجاح");
      router.push("/teacher"); // رجوع للوحة المعلم بعد الحفظ
    } catch (error) {
      // ✅ الخطأ سيظهر تلقائياً عبر Toast من axios interceptor
      console.error("❌ خطأ أثناء حفظ الامتحان:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        ✍️ إنشاء امتحان جديد
      </h1>

      <input
        placeholder="📝 اسم الامتحان"
        className="border p-2 mb-3 w-full"
        value={form.examName}
        onChange={(e) => setForm({ ...form, examName: e.target.value })}
      />
      <input
        placeholder="📚 المادة"
        className="border p-2 mb-3 w-full"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
      />
      <input
        placeholder="🎓 الصف"
        className="border p-2 mb-3 w-full"
        value={form.grade}
        onChange={(e) => setForm({ ...form, grade: e.target.value })}
      />
      <input
        placeholder="📅 الفصل"
        className="border p-2 mb-3 w-full"
        value={form.term}
        onChange={(e) => setForm({ ...form, term: e.target.value })}
      />
      <input
        type="number"
        placeholder="⏱️ المدة بالدقائق"
        className="border p-2 mb-3 w-full"
        value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      />

      <hr className="my-4" />

      <h2 className="text-lg font-semibold mb-2 text-green-600">
        ➕ إضافة سؤال
      </h2>
      <input
        placeholder="📝 نص السؤال"
        className="border p-2 mb-2 w-full"
        value={currentQuestion.questionText}
        onChange={(e) =>
          setCurrentQuestion({
            ...currentQuestion,
            questionText: e.target.value,
          })
        }
      />

      {currentQuestion.options.map((opt, i) => (
        <input
          key={i}
          placeholder={`🔘 خيار ${i + 1}`}
          className="border p-2 mb-2 w-full"
          value={opt}
          onChange={(e) => {
            const updated = [...currentQuestion.options];
            updated[i] = e.target.value;
            setCurrentQuestion({ ...currentQuestion, options: updated });
          }}
        />
      ))}

      <input
        placeholder="✅ الإجابة الصحيحة"
        className="border p-2 mb-3 w-full"
        value={currentQuestion.correctAnswer}
        onChange={(e) =>
          setCurrentQuestion({
            ...currentQuestion,
            correctAnswer: e.target.value,
          })
        }
      />

      <button
        onClick={handleAddQuestion}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        ➕ أضف السؤال
      </button>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded font-bold"
        >
          ✅ حفظ الامتحان
        </button>
      </div>

      <p className="mt-4 text-gray-600">
        📦 عدد الأسئلة المضافة: {form.questions.length}
      </p>
    </div>
  );
}
