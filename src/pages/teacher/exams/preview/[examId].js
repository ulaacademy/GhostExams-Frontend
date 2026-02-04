"use client";

import TeacherLayout from "@/components/TeacherLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchTeacherCustomExamById } from "@/services/api";
import Link from "next/link";

export default function TeacherExamPreviewPage() {
  const router = useRouter();
  const { examId } = router.query;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !examId) return;

    const load = async () => {
      try {
        const data = await fetchTeacherCustomExamById(examId);
        setExam(data?.exam || data); // حسب شكل الريسبونس عندك
      } catch {
        console.error("❌ فشل جلب الامتحان للمعاينة:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router.isReady, examId]);

  return (
    <TeacherLayout>
      <div className="p-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            👁️ معاينة الامتحان
          </h1>
          <Link
            href="/teacher/exams"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ⬅️ رجوع
          </Link>
        </div>

        {loading ? (
          <p>⏳ جاري التحميل...</p>
        ) : !exam ? (
          <p className="text-red-600">❌ الامتحان غير موجود</p>
        ) : (
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-bold mb-2">📘 {exam.examName}</h2>
            <p className="text-sm text-gray-700 mb-4">
              📚 المادة: {exam.subject} | 🧪 الصف: {exam.grade} | 📅 الفصل:{" "}
              {exam.term} | ⏱️ المدة: {exam.duration} دقيقة
            </p>

            <div className="space-y-4">
              {(exam.questions || []).map((q, idx) => (
                <div
                  key={q._id || idx}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="font-semibold mb-2">
                    {idx + 1}) {q.questionText}
                  </div>

                  <ul className="space-y-1">
                    {(q.options || []).map((op, i) => {
                      const isCorrect = op === q.correctAnswer;
                      return (
                        <li
                          key={i}
                          className={`p-2 rounded ${
                            isCorrect
                              ? "bg-green-100 border border-green-400 font-semibold"
                              : "bg-white border"
                          }`}
                        >
                          {op} {isCorrect ? "✅" : ""}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
