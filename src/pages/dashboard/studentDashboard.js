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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const queryUserId = router?.query?.userId || null; // ✅ أضفه هون

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
        `${EXAM_API_BASE}/exams/custom-exams/${examId}`
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
        fallbackExamObj
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
    [fetchExamDetails]
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
      const latestRaw = latestRawWrap?.latestResult || latestRawWrap; // ✅ فك التغليف

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

      // نرجّعهم بنفس ترتيبهم الأصلي + نخزن كل التاريخ لو بدك
      // هون بنخزن آخر 10 فقط لأنك بتعرض آخر 10/4 أساسًا
      setExamHistory(enrichedLast10);

      // ✅ متوسط آخر 4
      const lastFour = enrichedLast10.slice(-4);
      const avg =
        lastFour.length > 0
          ? Math.round(
              lastFour.reduce((sum, r) => sum + (Number(r?._percent) || 0), 0) /
                lastFour.length
            )
          : 0;
      setPerformanceAverage(avg);

      // ✅ بيانات الأداء
      const performanceData = await fetchStudentPerformance(userId);
      setPerformance(Array.isArray(performanceData) ? performanceData : []);

      // ✅ امتحانات المعلمين (القائمة المتاحة)
      const examsFromTeachers = await fetchTeacherCustomExams();
      setTeacherExams(
        Array.isArray(examsFromTeachers) ? examsFromTeachers : []
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

  // ✅ قراءة رسالة pending من الرابط (جاية من student/subscription بعد الإرسال)
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
        <div
          dir="rtl"
          className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg"
        >
          <h1 className="text-2xl font-bold text-blue-600 mb-4">
            📊 لوحة تحكم الطالب
          </h1>

          {/* ✅ تنبيه الاشتراك للطالب (يظهر فقط إذا ما عنده اشتراك Active ولا طلب Pending) */}
          {!subLoading && !isSubscribed && !subStatus.pending && (
            <div
              dir="rtl"
              className="mb-6 rounded-xl bg-blue-600 p-5 text-white shadow-lg"
            >
              <div className="text-center text-xl font-extrabold">
                أهلاً فيك {studentDetails?.name || "الطالب"} 👋
              </div>

              <div className="mt-2 text-center text-lg font-bold">
                حسابك مجاني يسمح فقط بتجربة امتحانات المعلم الافتراضي. للحصول
                على المزيد من الامتحانات، فعّل حسابك من هنا ✅
              </div>

              <div className="mt-4 flex justify-center">
                <Link href="/dashboard/student/subscription">
                  <button className="rounded-lg bg-white px-7 py-3 text-lg font-extrabold text-blue-700 hover:bg-gray-100 transition">
                    📦 تفعيل الاشتراك الآن
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* ✅ إذا عنده طلب قيد المراجعة */}
          {!subLoading && !isSubscribed && !!subStatus.pending && (
            <div
              dir="rtl"
              className="mb-6 rounded-xl bg-yellow-400 p-5 text-black shadow-lg"
            >
              <div className="text-center text-lg font-extrabold">
                ✅ تم إرسال طلبك سابقًا وهو قيد المراجعة. الرجاء الانتظار لتفعيل
                الاشتراك.
              </div>
            </div>
          )}

          {/* ✅ رسائل الاشتراك (Pending / Active) */}
          {!subStatus.loading && (
            <>
              {/* ✅ إذا الاشتراك صار Active */}
              {subStatus.active ? (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                  ✅ تم تفعيل اشتراكك بنجاح.
                  <div className="mt-1 text-sm text-green-700">
                    الخطة الحالية:{" "}
                    <b>
                      {subStatus?.active?.planSnapshot?.name ||
                        subStatus?.active?.planSnapshot?.title ||
                        "الخطة"}
                    </b>
                  </div>
                </div>
              ) : null}

              {/* ✅ إذا في Pending أو جاي من الرابط status=pending */}
              {!subStatus.active &&
              (subStatus.pending || statusQuery === "pending") ? (
                <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
                  ⏳ تم إرسال طلبك للاشتراك بحزمة <b>{pendingPlanName}</b>.
                  <div className="mt-1 text-sm text-yellow-800">
                    الرجاء الانتظار، سيتم تفعيل الاشتراك بعد تأكيد عملية الدفع
                    خلال <b>24 ساعة</b>.
                  </div>
                </div>
              ) : null}
            </>
          )}

          {loading ? (
            <p className="text-center text-gray-500">🔄 تحميل البيانات...</p>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadDashboardData();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                🔄 إعادة المحاولة
              </button>
            </div>
          ) : (
            <>
              {/* ✅ نتيجة آخر امتحان */}
              {latestExamResult ? (
                <Card className="bg-white p-4 rounded shadow-md mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      ✅ نتيجة آخر امتحان:
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <p>
                      🧾 اسم الامتحان:{" "}
                      <b className="text-gray-900">
                        {latestExamResult?._exam?.examName ||
                          latestExamResult?._exam?.subject ||
                          "غير متاح"}
                      </b>
                    </p>

                    <p>
                      📚 المادة:{" "}
                      {latestExamResult?._exam?.subject ?? "غير متاحة"}
                    </p>

                    <p>
                      📅 التاريخ:{" "}
                      {latestExamResult?._date
                        ? new Date(latestExamResult._date).toLocaleDateString()
                        : "غير متاح"}
                    </p>

                    <p className="font-bold text-gray-900">
                      🎯 النتيجة: {latestExamResult?._correct ?? 0} /{" "}
                      {latestExamResult?._total ?? 0}{" "}
                      <span className="text-blue-700">
                        ({latestExamResult?._percent ?? 0}%)
                      </span>
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={() => handleRetake(latestExamResult?._examId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
                      >
                        🔁 أعد الامتحان
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white p-4 rounded shadow-md mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      📌 لا توجد نتائج امتحانات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      ⚠️ لم تقم بإجراء أي امتحانات بعد.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* ✅ آخر 4/10 نتائج */}
              {examHistory.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">
                    🧾 نتائج الامتحانات التى قدمتها ( اخر 4 امتحانات )
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examHistory
                      .slice(-10)
                      .reverse()
                      .map((exam, index) => {
                        const title =
                          exam?._exam?.examName ||
                          exam?._exam?.subject ||
                          "امتحان";

                        return (
                          <Card
                            key={index}
                            className="shadow-lg rounded-lg p-4"
                          >
                            <CardHeader>
                              <CardTitle className="text-lg font-semibold">
                                {title}
                              </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-2">
                              <p className="text-gray-600">
                                📅{" "}
                                {exam?._date
                                  ? new Date(exam._date).toLocaleDateString()
                                  : "غير متاح"}
                              </p>

                              <p className="text-gray-800 font-bold">
                                🎯 النتيجة: {exam?._correct ?? 0} /{" "}
                                {exam?._total ?? 0}{" "}
                                <span className="text-blue-700">
                                  ({exam?._percent ?? 0}%)
                                </span>
                              </p>

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleRetake(exam?._examId)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
                                >
                                  🔁 أعد الامتحان
                                </button>

                                <button
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/exams/custom/${exam?._examId}`
                                    )
                                  }
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                >
                                  👀 عرض الامتحان
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ✅ امتحانات من معلمك */}
              {teacherExams.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-blue-600 mb-4">
                    📘 جرب امتحانات مجانية من معلمك الافتراضي ( جرب طريقة
                    الامتحانات فقط ){" "}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacherExams.slice(0, 4).map((exam, index) => (
                      <div
                        key={index}
                        className="border p-4 rounded shadow bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/exams/custom/${exam._id}`)
                        }
                      >
                        <h3 className="font-semibold text-lg">
                          {exam.examName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📚 المادة: {exam.subject} | 🧪 الصف: {exam.grade} | 📅
                          الفصل: {exam.term}
                        </p>
                        <p className="text-sm mt-1 text-gray-500">
                          🕒 المدة: {exam.duration} دقيقة
                        </p>
                        <div className="mt-3">
                          <div className="inline-block px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold">
                            ابدأ الامتحان
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {teacherExams.length > 4 && (
                    <div className="mt-4 flex justify-center">
                      <Link href="/dashboard/subscribed-teachers">
                        <Button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                          📌 عرض كل امتحانات المعلمين المشترك معهم{" "}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ تطور أداء الطالب */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">
                  📊 تطور أدائك عبر الامتحانات
                </h2>

                <p className="text-md text-gray-600 mb-2">
                  📈 متوسط أدائك في آخر 4 امتحانات:{" "}
                  <span className="font-bold text-blue-600">
                    {performanceAverage}% - قدم امتحانات اضافية لتقوية ذاكرتك
                    ورفع مستواك
                  </span>
                </p>

                <p className="text-sm text-green-600 mb-4">
                  {performanceAverage < 50
                    ? "⚠️ مستواك يحتاج إلى مراجعة، حاول التركيز على نقاط ضعفك."
                    : performanceAverage < 80
                    ? "✅ أنت على الطريق الصحيح، استمر بالمذاكرة المنتظمة."
                    : "🎉 أداء ممتاز! حافظ على هذا المستوى الرائع 👏"}
                </p>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={examHistory.slice(-10).map((exam) => ({
                      name:
                        exam?._exam?.examName ||
                        exam?._exam?.subject ||
                        "امتحان",
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

              {/* ✅ روابط إضافية */}
              <div className="mt-6 flex justify-between">
                <Link href="/dashboard/performance">
                  <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
                    📊 تحليل أدائك بالتفصيل
                  </Button>
                </Link>

                <Link href="/dashboard/exams">
                  <Button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200">
                    📚 جرب امتحان جديد
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
