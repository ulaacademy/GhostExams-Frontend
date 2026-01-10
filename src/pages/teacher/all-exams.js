"use client";
import TeacherLayout from "@/components/TeacherLayout";
import { useEffect, useState } from "react";
import { fetchTeacherCustomExamsWithResults } from "@/services/api";
import Link from "next/link";

export default function AllExamsPage() {
  const [teacherExams, setTeacherExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        console.log("📡 بدء جلب امتحانات المعلم...");
        const exams = await fetchTeacherCustomExamsWithResults();
        console.log("✅ تم جلب الامتحانات:", exams);
        console.log("📊 عدد الامتحانات:", exams?.length || 0);
        
        // ✅ التحقق من بنية البيانات
        if (exams && Array.isArray(exams)) {
          setTeacherExams(exams);
          setError(null);
        } else {
          console.warn("⚠️ البيانات المسترجعة ليست مصفوفة:", exams);
          setTeacherExams([]);
          setError("⚠️ البيانات المسترجعة غير صحيحة");
        }
      } catch (error) {
        console.error("❌ فشل في جلب جميع الامتحانات:", error);
        console.error("❌ تفاصيل الخطأ:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        
        // ✅ عرض رسالة خطأ واضحة
        if (error.response?.status === 401) {
          setError("❌ انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
        } else if (error.response?.status === 400) {
          setError(`❌ خطأ في الطلب: ${error.response?.data?.message || error.message}`);
        } else {
          setError(`❌ فشل في جلب الامتحانات: ${error.message || "خطأ غير معروف"}`);
        }
        setTeacherExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <TeacherLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          📚 جميع امتحانات المعلم
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">⚠️ خطأ</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <p>⏳ جاري تحميل الامتحانات...</p>
          ) : error ? (
            <p className="text-red-600">❌ {error}</p>
          ) : teacherExams.length === 0 ? (
            <p>⚠️ لا يوجد امتحانات حالياً.</p>
          ) : (
            teacherExams.map((exam) => (
              <div
                key={exam._id || exam.id}
                className="border p-4 rounded shadow bg-blue-50 hover:bg-blue-100 transition"
              >
                <h3 className="font-semibold text-lg text-blue-700">
                  📘 {exam.examName || "امتحان بدون اسم"}
                </h3>
                <p className="text-sm text-gray-700">
                  📚 المادة: {exam.subject || "غير محدد"} | 🧪 الصف: {exam.grade || "غير محدد"} | 📅 الفصل: {exam.term || "غير محدد"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  📝 عدد الأسئلة: {exam.questions?.length || 0}
                </p>
                <p className="text-sm text-green-600 mt-2 font-semibold">
                  👨‍🎓 عدد الطلاب الذين قدموا الامتحان: {exam.studentsCount || 0}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard/teacher">
            <button className="bg-gray-500 hover:bg-gray-700 text-white px-6 py-2 rounded shadow">
              🔙 رجوع إلى لوحة التحكم
            </button>
          </Link>
        </div>
      </div>
    </TeacherLayout>
  );
}
