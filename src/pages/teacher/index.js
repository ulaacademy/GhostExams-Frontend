// ✅ استيراد الملفات المطلوبة
"use client";
import TeacherLayout from "@/components/TeacherLayout";
import { useAuth } from "@/context/AuthContext";
import {
  fetchTeacherDashboardMetrics,
  fetchTeacherStudentsPerformance,
  fetchTeacherCustomExamsWithResults,
  fetchExamStudentsCount,
  fetchActiveSubscription,
  fetchUserId,
} from "@/services/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ExamMetricsChart from "@/components/ExamMetricsChart";
import { useCallback } from "react"; // ✅ استيراد useCallback في الأعلى

export default function TeacherDashboard() {
  const { authToken, user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [teacherExams, setTeacherExams] = useState([]);
  const [studentsPerformance, setStudentsPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ اشتراك المعلم (لإظهار/إخفاء التنبيه)
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  // ✅ دالة لجلب إحصائيات الداشبورد
  const fetchMetrics = useCallback(async () => {
    if (!authToken) {
      console.warn("⚠️ لم يتم العثور على التوكن، تخطي جلب البيانات");
      setLoading(false);
      return;
    }
    try {
      const data = await fetchTeacherDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("❌ خطأ في تحميل بيانات الداشبورد:", error);
      if (error.isBanned || error.response?.status === 403) {
        return;
      }
      setLoading(false);
    }
  }, [authToken]);

  // ✅ دالة لجلب امتحانات المعلم
  const fetchExams = useCallback(async () => {
    if (!authToken) {
      console.warn("⚠️ لم يتم العثور على التوكن، تخطي جلب الامتحانات");
      setLoading(false);
      return;
    }
    try {
      const exams = await fetchTeacherCustomExamsWithResults();
      setTeacherExams(exams || []);
    } catch (error) {
      console.error("❌ فشل في جلب امتحانات المعلم:", error);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // ✅ دالة لجلب أداء الطلاب
  const fetchStudentsPerformance = useCallback(async () => {
    try {
      if (authToken) {
        const data = await fetchTeacherStudentsPerformance(authToken);
        setStudentsPerformance(data.students || []);
      }
    } catch (error) {
      console.error("❌ فشل في جلب أداء الطلاب:", error);
    }
  }, [authToken]);

  // ✅ عند تحميل الصفحة
  useEffect(() => {
    if (authToken && user) {
      fetchMetrics();
      fetchExams();
      fetchStudentsPerformance();
    } else {
      setLoading(false);
    }
  }, [authToken, user, fetchMetrics, fetchExams, fetchStudentsPerformance]);

  // ✅ جلب حالة الاشتراك لإخفاء التنبيه عند وجود اشتراك نشط
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        if (!authToken) {
          setSubLoading(false);
          return;
        }

        const userId = await fetchUserId();
        if (!userId) {
          setSubLoading(false);
          return;
        }

        const activeResponse = await fetchActiveSubscription(userId);
        if (activeResponse?.success && activeResponse?.data) {
          setActiveSubscription(activeResponse.data);
        }
      } catch (err) {
        console.error("❌ فشل في جلب الاشتراك النشط:", err);
      } finally {
        setSubLoading(false);
      }
    };

    loadSubscription();
  }, [authToken]);

  const isSubscribed = activeSubscription?.status === "active";

  // ✅ كومبوننت داخلي لعرض كارد كل امتحان
  function ExamCard({ exam }) {
    const [studentsCount, setStudentsCount] = useState(0);

    useEffect(() => {
      const getCount = async () => {
        try {
          const count = await fetchExamStudentsCount(exam._id);
          setStudentsCount(count);
        } catch (error) {
          console.error("❌ فشل في جلب عدد الطلاب:", error);
        }
      };
      getCount();
    }, [exam._id]);

    return (
      <div className="border p-4 rounded shadow bg-blue-50 hover:bg-blue-100 transition">
        <h3 className="font-semibold text-lg text-blue-700">
          📘 {exam.examName}
        </h3>
        <p className="text-sm text-gray-700">
          📚 المادة: {exam.subject} | 🧪 الصف: {exam.grade} | 📅 الفصل:{" "}
          {exam.term}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          📝 عدد الأسئلة: {exam.questions.length}
        </p>
        <p className="text-sm text-green-600 mt-2 font-semibold">
          👨‍🎓 عدد الطلاب الذين قدموا الامتحان: {studentsCount}
        </p>
      </div>
    );
  }

  const teacherName = user?.name || "أستاذنا";

  return (
    <TeacherLayout teacherName={user?.name}>
      <div className="p-6">
        {/* ✅ عنوان الصفحة بالوسط */}
        <h1 className="text-2xl font-extrabold text-blue-700 mb-4 text-center">
          🎓 لوحة تحكم المعلم
        </h1>

        {/* ✅ تنبيه اشتراك (يظهر فقط إذا المعلم غير مشترك) */}
        {!subLoading && !isSubscribed && (
          <div
            dir="rtl"
            className="mb-6 rounded-xl bg-red-600 p-5 text-white shadow-lg"
          >
            <div className="text-center text-xl font-extrabold">
              أهلاً فيك {teacherName} 👋 أنت في لوحة التحكم الخاصة بك
            </div>

            <div className="mt-2 text-center text-lg font-bold">
              لتفعيل كل الخدمات والاشتراك، يرجى تعبئة الفورم التالي من هنا
            </div>

            <div className="mt-4 flex justify-center">
              <Link href="/teacher/subscription">
                <button className="rounded-lg bg-white px-7 py-3 text-lg font-extrabold text-red-700 hover:bg-gray-100 transition">
                  ✅ تفعيل الاشتراك الآن
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ✅ كروت الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-blue-700">
              {metrics?.totalStudents ?? 0}
            </div>
            <div className="text-gray-700 mt-2">عدد الطلاب</div>
          </div>

          <div className="bg-green-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-green-700">
              {metrics?.activeExams ?? 0}
            </div>
            <div className="text-gray-700 mt-2">عدد الامتحانات</div>
          </div>

          <div className="bg-red-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-red-700">
              {metrics?.totalExamsSubmitted ?? 0}
            </div>
            <div className="text-gray-700 mt-2">عدد الامتحانات المقدمة</div>
          </div>

          <div className="bg-yellow-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-yellow-700">
              {metrics?.averageScore ?? 0}%
            </div>
            <div className="text-gray-700 mt-2">متوسط الأداء</div>
          </div>

          <div className="bg-purple-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-purple-700">
              {metrics?.topPerformers ?? 0}
            </div>
            <div className="text-gray-700 mt-2">أفضل الطلاب</div>
          </div>
        </div>

        {/* ✅ دونات شارت */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-bold text-center mb-4 text-blue-700">
              📚 أداء المواد
            </h2>
            <ExamMetricsChart data={metrics?.subjectPerformance || []} />
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-bold text-center mb-4 text-blue-700">
              📊 توزيع الدرجات
            </h2>
            <ExamMetricsChart data={metrics?.gradeDistribution || []} />
          </div>
        </div>

        {/* ✅ رسم بياني (أداء الطلاب حسب المواد) */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-4">
            📈 أداء الطلاب حسب المواد
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.subjectPerformance || []}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ عرض الامتحانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {loading ? (
            <p>⏳ جاري تحميل الامتحانات...</p>
          ) : teacherExams.length === 0 ? (
            <p>⚠️ لا يوجد امتحانات حالياً.</p>
          ) : (
            teacherExams
              .slice(0, 4)
              .map((exam) => <ExamCard key={exam._id} exam={exam} />)
          )}
        </div>

        {/* ✅ أزرار المعلم الرئيسية */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/teacher/exams" className="block">
              <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg p-5 transition">
                <div className="text-2xl font-extrabold mb-2 flex items-center justify-center gap-2">
                  📚 عرض الامتحانات
                </div>
                <p className="text-sm text-blue-100 text-center leading-6">
                  من هنا اعرض كل الامتحانات الموجودة داخل حسابك، وتابع الأداء
                  والنتائج.
                </p>
              </div>
            </Link>

            <Link href="/teacher/create-exam" className="block">
              <div className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg p-5 transition">
                <div className="text-2xl font-extrabold mb-2 flex items-center justify-center gap-2">
                  ➕ إنشاء امتحان يدوي
                </div>
                <p className="text-sm text-green-100 text-center leading-6">
                  من هنا انشاء الامتحان يدوي سؤال سؤال مع خيارات وإجابات صحيحة.
                </p>
              </div>
            </Link>

            <Link href="/teacher/upload-questions" className="block">
              <div className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg p-5 transition">
                <div className="text-2xl font-extrabold mb-2 flex items-center justify-center gap-2">
                  📥 رفع Excel جاهز
                </div>
                <p className="text-sm text-emerald-100 text-center leading-6">
                  من هنا ارفع ملفات Excel الجاهزة لاستيراد الأسئلة بسرعة وبدون
                  تعب.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ✅ جدول أداء الطلاب */}
        <div className="bg-white p-6 rounded shadow mt-8">
          <h2 className="text-xl font-bold text-blue-700 mb-4">
            🎯 أداء الطلاب في الامتحانات
          </h2>

          {studentsPerformance.length === 0 ? (
            <p>⚠️ لا يوجد بيانات طلاب حتى الآن.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-2 px-4 border-b">👨‍🎓 اسم الطالب</th>
                    <th className="py-2 px-4 border-b">📘 اسم الامتحان</th>
                    <th className="py-2 px-4 border-b">📊 النتيجة (%)</th>
                    <th className="py-2 px-4 border-b">📅 التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsPerformance.map((record, index) => (
                    <tr key={index} className="text-center hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">
                        {record.studentName}
                      </td>
                      <td className="py-2 px-4 border-b">{record.examName}</td>
                      <td className="py-2 px-4 border-b">{record.score}%</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
