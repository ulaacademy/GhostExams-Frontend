"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import {
  fetchLatestExamResult,
  fetchUserExamResults,
  fetchStudentPerformance,
  fetchTeacherCustomExams,
  fetchUserProfile,
} from "@/services/api";

//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchMyStudentSubscriptionStatus } from "@/services/api";

// ✅ نفس الدومين اللي تستخدمه بصفحة الامتحان
const EXAM_API_BASE = "https://ge-api.ghostexams.com/api";
const QUESTION_FALLBACK = 0;

function calcPercent(correct, total) {
  const c = Number(correct || 0);
  const t = Number(total || 0);
  if (!t) return 0;
  return Math.round((c / t) * 100);
}

// ✅ يحاول يفهم هل score هو "عدد صحيح" ولا "نسبة"
function normalizeScoreAndTotal(result, examObj) {
  const total =
    Number(result?.totalQuestions) ||
    Number(result?.questionsCount) ||
    Number(examObj?.questions?.length) ||
    Number(examObj?.totalQuestions) ||
    QUESTION_FALLBACK;

  const rawScore = result?.score;
  const perf =
    result?.performancePercentage ??
    result?.percentage ??
    result?.performance ??
    null;

  // إذا عندك correctAnswers (أفضل حالة)
  if (result?.correctAnswers !== undefined && total) {
    const correct = Number(result.correctAnswers) || 0;
    const percent = Number(perf) || calcPercent(correct, total);
    return { correct, total, percent };
  }

  // إذا score رقم
  if (rawScore !== undefined && rawScore !== null) {
    const s = Number(rawScore) || 0;

    // حالة 1: score يبدو "عدد صحيح" (<= total)
    if (total && s <= total) {
      const correct = s;
      const percent = Number(perf) || calcPercent(correct, total);
      return { correct, total, percent };
    }

    // حالة 2: score يبدو "نسبة" (<=100) ومعنا total
    if (total && s <= 100) {
      const percent = Number(perf) || s;
      const correct = Math.round((percent / 100) * total);
      return { correct, total, percent };
    }
  }

  // fallback: إذا في performancePercentage فقط
  if (total && perf !== null && perf !== undefined) {
    const percent = Number(perf) || 0;
    const correct = Math.round((percent / 100) * total);
    return { correct, total, percent };
  }

  // آخر fallback
  return { correct: 0, total: total || 0, percent: 0 };
}

// ✅ يرجع examId سواء object أو string
function extractExamIdValue(result) {
  // أكثر من شكل ممكن يرجع من الباك
  return (
    result?.examId ||
    result?.exam ||
    result?.customExamId ||
    result?.examRef ||
    null
  );
}

export default function StudentDashboard() {
  const router = useRouter();

  const { user, userId: authUserId } = useAuth();
  const queryUserId = router?.query?.userId || null;

  const userId =
    queryUserId || authUserId || user?.userId || user?.id || user?._id;

  const [teacherExams, setTeacherExams] = useState([]);
  const [, setPerformance] = useState([]);
  const [latestExamResult, setLatestExamResult] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [performanceAverage, setPerformanceAverage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [studentDetails, setStudentDetails] = useState({
    name: "الطالب",
    email: "",
  });

  // ✅ cache لتفاصيل الامتحانات عشان ما نعمل 10 requests كل رندر
  const examCacheRef = useRef(new Map());

  const fetchExamDetails = useCallback(async (examId) => {
    if (!examId) return null;
    if (examCacheRef.current.has(examId))
      return examCacheRef.current.get(examId);

    try {
      const res = await axios.get(
        `${EXAM_API_BASE}/exams/custom-exams/${examId}`,
      );
      const exam = res?.data?.exam || null;
      examCacheRef.current.set(examId, exam);
      return exam;
    } catch {
      examCacheRef.current.set(examId, null);
      return null;
    }
  }, []);

  // ✅ enrich result: لو examId string، جيب بيانات الامتحان وركّبها
  const enrichResult = useCallback(
    async (result) => {
      const examVal = extractExamIdValue(result);

      let examObj = null;
      let examId = null;

      if (typeof examVal === "string") {
        examId = examVal;
        examObj = await fetchExamDetails(examId);
      } else if (typeof examVal === "object" && examVal) {
        examObj = examVal;
        examId = examVal?._id || null;
      }

      // بعض الأحيان الاسم/المادة يرجعوا على root
      const fallbackExamObj = examObj || {
        _id: examId,
        examName: result?.examName,
        subject: result?.subject,
        questions: null,
      };

      const { correct, total, percent } = normalizeScoreAndTotal(
        result,
        fallbackExamObj,
      );

      return {
        ...result,
        _examId: examId,
        _exam: fallbackExamObj,
        _correct: correct,
        _total: total,
        _percent: percent,
        _date: result?.date || result?.createdAt || result?.updatedAt || null,
      };
    },
    [fetchExamDetails],
  );

  const loadDashboardData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("❌ لم يتم العثور على معرف الطالب. يرجى تسجيل الدخول مرة أخرى.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ آخر نتيجة
      const latestRawWrap = await fetchLatestExamResult(userId);
      const latestRaw = latestRawWrap?.latestResult || latestRawWrap;

      let latest = null;
      if (latestRaw && latestRaw.score !== undefined) {
        latest = await enrichResult(latestRaw);
      }

      setLatestExamResult(latest);

      // ✅ سجل النتائج
      const resultsWrap = await fetchUserExamResults(userId);
      const arr = Array.isArray(resultsWrap)
        ? resultsWrap
        : resultsWrap?.results || [];

      // enrich آخر 10 فقط (عشان السرعة)
      const last10 = arr.slice(-10);
      const enrichedLast10 = await Promise.all(last10.map(enrichResult));

      setExamHistory(enrichedLast10);

      // ✅ متوسط آخر 4
      const lastFour = enrichedLast10.slice(-4);
      const avg =
        lastFour.length > 0
          ? Math.round(
              lastFour.reduce((sum, r) => sum + (Number(r?._percent) || 0), 0) /
                lastFour.length,
            )
          : 0;
      setPerformanceAverage(avg);

      // ✅ بيانات الأداء
      const performanceData = await fetchStudentPerformance(userId);
      setPerformance(Array.isArray(performanceData) ? performanceData : []);

      // ✅ امتحانات المعلمين
      const examsFromTeachers = await fetchTeacherCustomExams();
      setTeacherExams(
        Array.isArray(examsFromTeachers) ? examsFromTeachers : [],
      );
    } catch (err) {
      console.error("❌ خطأ أثناء تحميل البيانات:", err);

      if (err?.response?.status === 404) {
        setLatestExamResult(null);
        setExamHistory([]);
        setPerformance([]);
        setError(null);
      } else {
        setError("❌ فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.");
      }
    }

    setLoading(false);
  }, [userId, enrichResult]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!userId) return;
    loadDashboardData();
  }, [router.isReady, userId, loadDashboardData]);

  useEffect(() => {
    const resolveStudentDetails = async () => {
      const name = user?.name;
      const email = user?.email;

      if (name || email) {
        setStudentDetails({
          name: name || "الطالب",
          email: email || "",
        });
        return;
      }

      const profile = await fetchUserProfile();
      if (profile) {
        setStudentDetails({
          name: profile.name || "الطالب",
          email: profile.email || "",
        });
      }
    };

    resolveStudentDetails();
  }, [user]);

  const handleRetake = (examId) => {
    if (!examId) return;
    router.push(`/dashboard/exams/custom/${examId}?retake=1`);
  };

  const [subStatus, setSubStatus] = useState({
    loading: true,
    active: null,
    pending: null,
  });

  const subLoading = subStatus.loading;
  const isSubscribed = !!subStatus.active;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyStudentSubscriptionStatus();
        setSubStatus({
          loading: false,
          active: data?.activeSubscription || null,
          pending: data?.pendingSubscription || null,
        });
      } catch {
        setSubStatus({ loading: false, active: null, pending: null });
      }
    };
    load();
  }, []);

  // ✅ قراءة رسالة pending من الرابط
  const statusQuery = router?.query?.status || null;
  const planQueryRaw = router?.query?.plan || null;

  let planFromQuery = null;
  try {
    planFromQuery =
      typeof planQueryRaw === "string"
        ? decodeURIComponent(planQueryRaw)
        : null;
  } catch {
    planFromQuery = typeof planQueryRaw === "string" ? planQueryRaw : null;
  }

  // ✅ اسم الخطة من الباك إذا في pending (أفضل)
  const pendingPlanName =
    subStatus?.pending?.planSnapshot?.name ||
    subStatus?.pending?.planSnapshot?.title ||
    subStatus?.pending?.planName ||
    planFromQuery ||
    "الخطة";

return (
  <ProtectedRoute requiredRole="student">
    <DashboardNavbar student={studentDetails}>
      <div dir="rtl" className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header: title + next step */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700">
                لوحة تحكم الطالب 📊
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                أهلاً فيك{" "} 
                <span className="font-bold text-gray-900">
                  {studentDetails?.name || "الطالب"}
                </span>{" "}
                👋
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Link href="/dashboard/subscribed-teachers">
                <Button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition">
                  🚀 ابدأ امتحان الآن
                </Button>
              </Link>

              <Link href="/dashboard/performance">
                <Button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                  📈 اعرف مستواك
                </Button>
              </Link>

              {!subLoading && !isSubscribed && (
                <Link href="/dashboard/student/subscription">
                  <Button className="px-4 py-2 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition font-bold">
                    ⭐ فعّل الاشتراك
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Subscription banners (shorter + clearer) */}
          <div className="mt-4 space-y-3">
            {!subLoading && !isSubscribed && !subStatus.pending && (
              <div className="rounded-2xl bg-yellow-600 text-white p-4 md:p-5 shadow-lg">
                <div className="font-extrabold text-center text-base md:text-lg">
                  حسابك مجاني للتجربة ✅ — فعّل الاشتراك واكشف عالم اخر من الامتحانات الوزارية المتوقعة  - امتحانات أكثر
                  - الاسعار والبكجات من هنا 
                </div>
                <div className="text-center text-sm md:text-base mt-2">
                  واتس اب الدعم:{" "}
                  <span dir="ltr" className="font-extrabold">
                    0791515106
                  </span>
                </div>

                <div className="mt-3 flex justify-center">
                  <Link href="/dashboard/student/subscription">
                    <button className="rounded-xl bg-white px-6 py-3 text-blue-700 font-extrabold hover:bg-gray-100 transition">
                      📦 اسعار البكجات | وطلب التفعيل من هنا 
                                          </button>
                  </Link>
                </div>
              </div>
            )}

            {!subLoading && !isSubscribed && !!subStatus.pending && (
              <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-900">
                <div className="font-extrabold text-center">
                  ⏳ طلب اشتراكك قيد المراجعة — بنفعّله بعد تأكيد الدفع خلال 24 ساعة
                </div>
              </div>
            )}

            {!subStatus.loading && subStatus.active ? (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-green-800">
                <div className="font-extrabold">✅ اشتراكك فعّال</div>
                <div className="text-sm mt-1 text-green-700">
                  الخطة الحالية:{" "}
                  <b>
                    {subStatus?.active?.planSnapshot?.name ||
                      subStatus?.active?.planSnapshot?.title ||
                      "الخطة"}
                  </b>
                </div>
              </div>
            ) : null}

            {!subStatus.active &&
            !subStatus.loading &&
            (subStatus.pending || statusQuery === "pending") ? (
              <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-900">
                ⏳ تم إرسال طلب الاشتراك بحزمة <b>{pendingPlanName}</b>.
                <div className="text-sm text-yellow-800 mt-1">
                  سيتم التفعيل بعد تأكيد الدفع خلال <b>24 ساعة</b>. تواصل معنا على واتس اب 0791515106 لتفعيل الحساب 
ارسل قيمة الاشتراك كليك للحساب ( المعرّف: GHOSTEXAMS)
                </div>
              </div>
            ) : null}
          </div>

          {/* Loading / Error */}
          <div className="mt-4">
            {loading ? (
              <div className="text-center text-gray-500 font-bold">
                🔄 تحميل البيانات...
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <div className="text-red-500 font-bold mb-3">{error}</div>
                <button
                  onClick={() => {
                    setError(null);
                    loadDashboardData();
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
                >
                  🔄 إعادة المحاولة
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {/* Teacher exams: clear CTA */}
            {teacherExams.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl font-extrabold text-blue-700">
                    🎁 امتحانات مجانية للتجربة
                  </h2>
                  <span className="text-sm text-gray-500">
                    جرّب طريقة الامتحانات قبل الاشتراك
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teacherExams.slice(0, 6).map((exam, index) => (
                    <div
                      key={index}
                      className="border rounded-2xl p-4 hover:shadow-md transition cursor-pointer bg-blue-50"
                      onClick={() => router.push(`/dashboard/exams/custom/${exam._id}`)}
                    >
                      <div className="font-extrabold text-gray-900 text-lg">
                        {exam.examName}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        📚 {exam.subject} • 🧪 {exam.grade} • 📅 {exam.term}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        🕒 المدة: <b>{exam.duration}</b> دقيقة
                      </div>

                      <div className="mt-3">
                        <div className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold">
                          ▶️ ابدأ الآن
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {teacherExams.length > 6 && (
                  <div className="mt-4 flex justify-center">
                    <Link href="/dashboard/subscribed-teachers">
                      <Button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                        📌 عرض كل امتحانات المعلمين
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}


        {/* Main content */}
        {!loading && !error && (
          <>
            {/* KPI cards: super practical */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl shadow-md p-4 border">
                <div className="text-sm text-gray-500">آخر نتيجة</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">
                  {latestExamResult ? `${latestExamResult?._percent ?? 0}%` : "—"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {latestExamResult?._exam?.subject ||
                    latestExamResult?._exam?.examName ||
                    "لم تقدّم امتحان بعد"}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border">
                <div className="text-sm text-gray-500">متوسط آخر 4 امتحانات</div>
                <div className="text-2xl font-extrabold text-blue-700 mt-1">
                  {performanceAverage}%
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {performanceAverage < 50
                    ? "ابدأ بمراجعة نقاط ضعفك"
                    : performanceAverage < 80
                      ? "ممتاز — كمّل بنفس الوتيرة"
                      : "🔥 أداء قوي جدًا"}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border">
                <div className="text-sm text-gray-500">عدد الامتحانات الأخيرة</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">
                  {examHistory?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  (نعرض آخر 10 نتائج عندك)
                </div>
              </div>
            </div>

            {/* Latest Exam Result (action-focused) */}
            <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-extrabold text-gray-900">
                  ✅ آخر امتحان
                </h2>

                {latestExamResult?._examId ? (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleRetake(latestExamResult?._examId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
                    >
                      🔁 أعد الامتحان
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/exams/custom/${latestExamResult?._examId}`,
                        )
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-bold"
                    >
                      👀 عرض
                    </button>
                  </div>
                ) : (
                  <Link href="/dashboard/subscribed-teachers">
                    <Button className="bg-green-500 text-white rounded-xl hover:bg-green-600">
                      🚀 ابدأ أول امتحان
                    </Button>
                  </Link>
                )}
              </div>

              {latestExamResult ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-gray-50 border p-3">
                    <div className="text-sm text-gray-500">اسم الامتحان</div>
                    <div className="font-bold text-gray-900">
                      {latestExamResult?._exam?.examName ||
                        latestExamResult?._exam?.subject ||
                        "غير متاح"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border p-3">
                    <div className="text-sm text-gray-500">النتيجة</div>
                    <div className="font-extrabold text-blue-700 text-lg">
                      {latestExamResult?._correct ?? 0}/{latestExamResult?._total ?? 0}{" "}
                      ({latestExamResult?._percent ?? 0}%)
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border p-3">
                    <div className="text-sm text-gray-500">التاريخ</div>
                    <div className="font-bold text-gray-900">
                      {latestExamResult?._date
                        ? new Date(latestExamResult._date).toLocaleDateString()
                        : "غير متاح"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-gray-600">
                  ⚠️ لم تقدّم أي امتحان بعد — اضغط “ابدأ امتحان الآن”.
                </div>
              )}
            </div>

            {/* Exam history (simple list cards) */}
            {examHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    🧾 آخر نتائجك
                  </h2>
                  <span className="text-sm text-gray-500">
                    آخر 10 امتحانات (الأحدث أولاً)
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {examHistory
                    .slice(-10)
                    .reverse()
                    .map((exam, index) => {
                      const title =
                        exam?._exam?.examName || exam?._exam?.subject || "امتحان";

                      return (
                        <div
                          key={index}
                          className="border rounded-2xl p-4 hover:shadow-md transition bg-white"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-extrabold text-gray-900">
                                {title}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                📅{" "}
                                {exam?._date
                                  ? new Date(exam._date).toLocaleDateString()
                                  : "غير متاح"}
                              </div>
                            </div>

                            <div className="text-blue-700 font-extrabold text-lg">
                              {exam?._percent ?? 0}%
                            </div>
                          </div>

                          <div className="mt-3 rounded-xl bg-gray-50 border p-3 font-bold text-gray-900">
                            🎯 {exam?._correct ?? 0}/{exam?._total ?? 0}
                          </div>

                          <div className="mt-3 flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleRetake(exam?._examId)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
                            >
                              🔁 أعد
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/dashboard/exams/custom/${exam?._examId}`)
                              }
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-bold"
                            >
                              👀 عرض
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            
            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                📊 تطور أدائك
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                هذا الرسم يعرض آخر 10 نتائج (كلما زادت الامتحانات، تطلع صورتك أوضح)
              </p>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={examHistory.slice(-10).map((exam) => ({
                    name: exam?._exam?.subject || exam?._exam?.examName || "امتحان",
                    performancePercentage: exam?._percent ?? 0,
                  }))}
                >
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="performancePercentage" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/dashboard/subscribed-teachers">
                <Button className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-extrabold">
                  🚀 ابدأ امتحان جديد
                </Button>
              </Link>

              <Link href="/dashboard/performance">
                <Button className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-extrabold">
                  📈 شوف تحليل أدائك
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardNavbar>
  </ProtectedRoute>
);

}
