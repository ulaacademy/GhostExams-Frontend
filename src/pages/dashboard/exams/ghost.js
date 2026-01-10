"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardNavbar from "@/components/DashboardNavbar";
import { fetchGhostExams } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function GhostExams() {
  const router = useRouter();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const data = await fetchGhostExams();
        setExams(data || []);
      } catch (err) {
        console.error("❌ خطأ في جلب امتحانات Ghost:", err);
        setError("❌ فشل في تحميل الامتحانات");
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  const handleExamClick = (examId) => {
    router.push(`/dashboard/exams/view/GhostExamView?examId=${examId}`);
  };

  const studentDetails = {
    name: user?.name || "الطالب",
    email: user?.email || "",
  };

  return (
    <DashboardNavbar student={studentDetails}>
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              👻 امتحانات Ghost Examinations
            </h1>
            <p className="text-gray-600">
              امتحانات متاحة لجميع الطلاب المسجلين في المنصة
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">⏳ جاري تحميل الامتحانات...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <p className="text-yellow-700 text-lg">
                ⚠️ لا توجد امتحانات متاحة حالياً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  onClick={() => handleExamClick(exam._id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex-1">
                      {exam.title}
                    </h3>
                    <span className="text-2xl">👻</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📚 المادة:</span>
                      <span>{exam.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">🧪 الصف:</span>
                      <span>{exam.grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📅 الفصل:</span>
                      <span>{exam.term}</span>
                    </div>
                    {exam.duration && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">🕒 المدة:</span>
                        <span>{exam.duration} دقيقة</span>
                      </div>
                    )}
                    {exam.questions && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">❓ عدد الأسئلة:</span>
                        <span>{exam.questions.length}</span>
                      </div>
                    )}
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    ابدأ الامتحان
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardNavbar>
  );
}

