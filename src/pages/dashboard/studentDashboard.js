"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import {
  fetchLatestExamResult,
  fetchUserExamResults,
  fetchStudentPerformance,
  fetchTeacherCustomExams,
  fetchUserProfile,
  fetchMyStudentSubscriptionStatus,
} from "@/services/api";
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

const EXAM_API_BASE = "https://ge-api.ghostexams.com/api";
const QUESTION_FALLBACK = 0;
const WHATSAPP_NUMBER = "0791515106";
const SUBSCRIPTION_PATH = "/dashboard/student/subscription";
const FREE_EXAMS_PREVIEW_LIMIT = 4;

function calcPercent(correct, total) {
  const c = Number(correct || 0);
  const t = Number(total || 0);
  if (!t) return 0;
  return Math.round((c / t) * 100);
}

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

  if (result?.correctAnswers !== undefined && total) {
    const correct = Number(result.correctAnswers) || 0;
    const percent = Number(perf) || calcPercent(correct, total);
    return { correct, total, percent };
  }

  if (rawScore !== undefined && rawScore !== null) {
    const s = Number(rawScore) || 0;

    if (total && s <= total) {
      const correct = s;
      const percent = Number(perf) || calcPercent(correct, total);
      return { correct, total, percent };
    }

    if (total && s <= 100) {
      const percent = Number(perf) || s;
      const correct = Math.round((percent / 100) * total);
      return { correct, total, percent };
    }
  }

  if (total && perf !== null && perf !== undefined) {
    const percent = Number(perf) || 0;
    const correct = Math.round((percent / 100) * total);
    return { correct, total, percent };
  }

  return { correct: 0, total: total || 0, percent: 0 };
}

function extractExamIdValue(result) {
  return (
    result?.examId ||
    result?.exam ||
    result?.customExamId ||
    result?.examRef ||
    null
  );
}

function getFreePerformanceMessage(latestPercent, averagePercent) {
  const latest = Number(latestPercent || 0);
  const avg = Number(averagePercent || 0);
  const value = latest || avg;

  if (!value) {
    return "ابدأ بأول امتحان مجاني، وبعدها فعّل الاشتراك حتى تفتح المزيد من الامتحانات والمواد.";
  }

  if (value < 50) {
    return "نتيجتك تحتاج تدريب أكثر — الاشتراك يفتح لك امتحانات أكثر وتمارين إضافية تساعدك ترفع مستواك.";
  }

  if (value < 80) {
    return "مستواك جيد، لكن التفعيل يساعدك تتقدم أسرع من خلال امتحانات أكثر وتحليل أوسع.";
  }

  return "أداؤك ممتاز — فعّل الاشتراك وافتح امتحانات أقوى حتى تحافظ على مستواك وتطوره أكثر.";
}

function StatCard({ title, value, note, valueClassName = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-extrabold mt-1 ${valueClassName}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 mt-1 leading-6">{note}</div>
    </div>
  );
}

function ReviewCard({ name, text }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-yellow-500 text-lg">★★★★★</div>
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold">
          {(name || "ط").charAt(0)}
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-7">“{text}”</p>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="font-extrabold text-gray-900">{name}</div>
        <div className="text-xs text-gray-500 mt-1">طالب على المنصة</div>
      </div>
    </div>
  );
}

function FAQCard({ q, a }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
      <h3 className="font-extrabold text-gray-900 leading-7">{q}</h3>
      <p className="text-sm text-gray-600 mt-2 leading-7">{a}</p>
    </div>
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

  const [subStatus, setSubStatus] = useState({
    loading: true,
    active: null,
    pending: null,
  });

  const examCacheRef = useRef(new Map());

  const reviews = useMemo(
    () => [
      {
        name: "محمد",
        text: "جرّبت المجاني أولًا، وبعدها فعّلت لأن الامتحانات وطريقة العرض فعلاً ساعدتني أدرس بشكل أوضح.",
      },
      {
        name: "لين",
        text: "أكثر شيء أقنعني أني أشترك هو أني شفت نتيجتي واحتجت امتحانات أكثر حتى أرفع مستواي.",
      },
      {
        name: "أحمد",
        text: "الموقع مرتب وسريع، والتفعيل فتح لي مجال أكبر للتدريب بدل الاكتفاء بعدد محدود من الامتحانات.",
      },
    ],
    [],
  );

  const faqs = useMemo(
    () => [
      {
        q: "هل أقدر أبدأ مجانًا؟",
        a: "نعم، الحساب مجاني للتجربة، وبعدها يمكنك تفعيل الاشتراك للوصول الكامل للامتحانات والأسئلة.",
      },
      {
        q: "ما أفضل باقة لمعظم الطلاب؟",
        a: "أفضل خيار لمعظم الطلاب حاليًا هو باقة 7  لأنها متوازنة جدًا بين السعر والمزايا.",
      },
      {
        q: "ماذا يفتح لي الاشتراك؟",
        a: "الاشتراك يفتح لك امتحانات أكثر، وصول أوسع، محتوى أقوى، وتجربة دراسة أكمل من الحساب المجاني.",
      },
      {
        q: "كيف يتم التفعيل؟",
        a: `تختار الباقة المناسبة وترسل طلب التفعيل، ويمكنك التواصل عبر واتساب على ${WHATSAPP_NUMBER} لتأكيد التفعيل.`,
      },
    ],
    [],
  );

  const freeLockedFeatures = useMemo(
    () => [
      {
        title: "امتحانات أكثر وأقوى",
        desc: "افتح مجموعة أوسع من الامتحانات بعد التفعيل بدل الاكتفاء بالتجربة المجانية.",
      },
      {
        title: "وصول كامل للمواد",
        desc: "استفد من تجربة أوسع بدل الاكتفاء بالمحتوى المفتوح للتجربة فقط.",
      },
      {
        title: "تدريب أوسع قبل الاختبار",
        desc: "كلما زادت الامتحانات التي تحلها، صار تصورك عن مستواك أوضح.",
      },
      {
        title: "تجربة دراسة أكمل",
        desc: "الحساب المجاني بداية فقط، أما التفعيل فيعطيك الوصول الحقيقي الذي تحتاجه للاستمرار.",
      },
    ],
    [],
  );

  const subLoading = subStatus.loading;
  const isSubscribed = !!subStatus.active;

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

  const pendingPlanName =
    subStatus?.pending?.planSnapshot?.name ||
    subStatus?.pending?.planSnapshot?.title ||
    subStatus?.pending?.planName ||
    planFromQuery ||
    "الخطة";

  const fetchExamDetails = useCallback(async (examId) => {
    if (!examId) return null;
    if (examCacheRef.current.has(examId)) {
      return examCacheRef.current.get(examId);
    }

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
      const latestRawWrap = await fetchLatestExamResult(userId);
      const latestRaw = latestRawWrap?.latestResult || latestRawWrap;

      let latest = null;
      if (latestRaw && latestRaw.score !== undefined) {
        latest = await enrichResult(latestRaw);
      }

      setLatestExamResult(latest);

      const resultsWrap = await fetchUserExamResults(userId);
      const arr = Array.isArray(resultsWrap)
        ? resultsWrap
        : resultsWrap?.results || [];

      const last10 = arr.slice(-10);
      const enrichedLast10 = await Promise.all(last10.map(enrichResult));
      setExamHistory(enrichedLast10);

      const lastFour = enrichedLast10.slice(-4);
      const avg =
        lastFour.length > 0
          ? Math.round(
              lastFour.reduce((sum, r) => sum + (Number(r?._percent) || 0), 0) /
                lastFour.length,
            )
          : 0;
      setPerformanceAverage(avg);

      const performanceData = await fetchStudentPerformance(userId);
      setPerformance(Array.isArray(performanceData) ? performanceData : []);

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

  const handleRetake = (examId) => {
    if (!examId) return;
    router.push(`/dashboard/exams/custom/${examId}?retake=1`);
  };

  const handleOpenExam = (examId) => {
    if (!examId) return;
    router.push(`/dashboard/exams/custom/${examId}`);
  };

  const freeExamPreview = teacherExams.slice(0, FREE_EXAMS_PREVIEW_LIMIT);
  const freePerformanceMessage = getFreePerformanceMessage(
    latestExamResult?._percent,
    performanceAverage,
  );

  const freeTrialCount = examHistory?.length || 0;
  const latestExamTitle =
    latestExamResult?._exam?.examName ||
    latestExamResult?._exam?.subject ||
    "لم تقدّم امتحان بعد";

  const latestExamDate = latestExamResult?._date
    ? new Date(latestExamResult._date).toLocaleDateString()
    : "غير متاح";

  return (
    <ProtectedRoute requiredRole="student">
      <DashboardNavbar student={studentDetails}>
        <div dir="rtl" className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700">
                    لوحة تحكم الطالب 📊
                  </h1>

                  {!subLoading && !isSubscribed && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-extrabold border border-yellow-200">
                      حساب مجاني
                    </span>
                  )}

                  {!subLoading && isSubscribed && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-extrabold border border-green-200">
                      اشتراك فعّال
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  أهلاً فيك{" "}
                  <span className="font-bold text-gray-900">
                    {studentDetails?.name || "الطالب"}
                  </span>{" "}
                  👋
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {!subLoading && !isSubscribed ? (
                  <>
                    <Link href="/dashboard/subscribed-teachers/6925950db9f708163dd423a7/exams">
                      <Button className="px-5 py-2.5 bg-yellow-700 text-black rounded-x2 hover:bg-yellow-400 transition font-extrabold">
                        ⭐ اضغط هنا لتجربة 38 امتحان مجاني
                      </Button>
                    </Link>
                    <Link href={SUBSCRIPTION_PATH}>
                      <Button className="px-5 py-2.5 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition font-extrabold">
                        ⭐ فعّل حسابك لكل الامتحانات
                      </Button>
                    </Link>

                    <Link href={SUBSCRIPTION_PATH}>
                      <Button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold">
                        📦 شاهد البكجات والاسعار
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard/subscribed-teachers">
                      <Button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-extrabold">
                        🚀 ابدأ امتحان الآن
                      </Button>
                    </Link>

                    <Link href="/dashboard/performance">
                      <Button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-extrabold">
                        📈 اعرف مستواك
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Pending / Active messages */}
            <div className="mt-4 space-y-3">
              {!subLoading && !isSubscribed && !subStatus.pending && (
                <div className="rounded-2xl bg-gradient-to-l from-yellow-500 to-amber-500 text-white p-5 shadow-lg">
                  <div className="text-center max-w-4xl mx-auto">
                    <div className="text-lg md:text-2xl font-extrabold leading-9">
                      أنت الآن على الحساب المجاني ✅
                    </div>

                    <div className="text-sm md:text-base mt-3 leading-8">
                      جرّبت الامتحانات المجانية ؟ التفعيل يفتح لك تجربة أقوى:
                      <span className="font-extrabold">
                        {" "}
                        اكثر من 8000+ سؤال{" "}
                      </span>
                      <span className="mx-1">•</span>
                      <span className="font-extrabold">
                        {" "}
                        اكثر من 120+ امتحان
                      </span>
                      <span className="mx-1">•</span>
                      امتحانات كاملة أكثر وأقوى
                      <span className="mx-1">•</span>
                      وصول أوسع للفصلين ولكل الامتحانات
                    </div>

                    <div className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-blue-700 font-extrabold text-sm md:text-base">
                      ⭐ أفضل باقة لمعظم الطلاب: باقة اربع مواد فصلين
                    </div>

                    <div className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-blue-700 font-extrabold text-sm md:text-base">
                      ⭐ عدد الطلاب الان : اكثر من +6000 طالب مشترك
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href={SUBSCRIPTION_PATH}>
                        <button className="rounded-xl bg-white px-6 py-3 text-blue-700 font-extrabold hover:bg-gray-100 transition shadow-sm">
                          🚀 فعّل حسابك الآن من هنا
                        </button>
                      </Link>

                      <a
                        href={`https://wa.me/962${WHATSAPP_NUMBER.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-blue-700 px-6 py-3 text-white font-extrabold hover:bg-blue-800 transition"
                      >
                        💬 واتساب تفعيل الحساب من هنا : {WHATSAPP_NUMBER}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {!subLoading && !isSubscribed && !!subStatus.pending && (
                <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-900">
                  <div className="font-extrabold text-center">
                    ⏳ طلب اشتراكك قيد المراجعة — بنفعّله بعد تأكيد الدفع  
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
                  <div className="text-sm text-yellow-800 mt-1 leading-7">
                    سيتم التفعيل بعد تأكيد الدفع خلال <b>24 ساعة</b>. تواصل معنا
                    على واتساب <b>{WHATSAPP_NUMBER}</b> لتفعيل الحساب، وأرسل
                    قيمة الاشتراك كليك للحساب (المعرّف: <b>GHOSTEXAMS</b>).
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

          {!loading && !error && !isSubscribed && (
            <>
              {/* Trial stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <StatCard
                  title="عدد الامتحانات التي جرّبتها"
                  value={freeTrialCount}
                  note="كل امتحان مجاني هو بداية فقط — التفعيل يفتح لك المزيد."
                  valueClassName="text-blue-700"
                />

                <StatCard
                  title="آخر نتيجة"
                  value={
                    latestExamResult
                      ? `${latestExamResult?._percent ?? 0}%`
                      : "—"
                  }
                  note={latestExamTitle}
                  valueClassName="text-gray-900"
                />

                <StatCard
                  title="متوسط آخر نتائجك"
                  value={`${performanceAverage}%`}
                  note={freePerformanceMessage}
                  valueClassName="text-yellow-600"
                />
              </div>

              {/* Best plan card */}
              <div className="bg-white rounded-2xl shadow-md p-5 md:p-6 border-2 border-yellow-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-extrabold border border-yellow-200">
                      الأكثر اختيارًا ⭐
                    </div>

                    <h2 className="text-2xl font-extrabold text-gray-900 mt-3">
                      الباقة الأنسب لمعظم الطلاب
                    </h2>

                    <p className="text-sm md:text-base text-gray-600 mt-2 leading-8">
                      إذا كنت تريد أفضل توازن بين السعر والمزايا، فاختيارك
                      الأفضل الآن هو{" "}
                      <span className="font-extrabold text-gray-900">
                        البكج الذهبي بسعر 7 دنانير
                      </span>
                      .
                    </p>

                    <div className="mt-3 text-gray-700 text-sm md:text-base leading-8">
                      ✅ مناسبة لكل الطلاب
                      <span className="mx-2">•</span>✅ تفتح لك كل الامتحانات
                      <span className="mx-2">•</span>✅ أفضل خيار للانتقال من
                      المجاني إلى الكامل
                    </div>
                  </div>

                  <div className="min-w-[220px] bg-yellow-50 rounded-2xl p-5 border border-yellow-200 text-center">
                    <div className="text-sm text-gray-600">أفضل عرض الآن</div>
                    <div className="text-4xl font-extrabold text-yellow-600 mt-2">
                      اربع مواد وزارية فصلين
                    </div>
                    <div className="text-base font-bold text-gray-800 mt-1">
                      بــ 7 دنانير فقط
                    </div>

                    <Link href={SUBSCRIPTION_PATH}>
                      <button className="w-full mt-4 rounded-xl bg-yellow-500 px-5 py-3 text-black font-extrabold hover:bg-yellow-400 transition">
                        اختر العرض الذهبي من هنا الآن
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Free exams */}
              {freeExamPreview.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl font-extrabold text-blue-700">
                        🎁 امتحانات مجانية للتجربة - 38 امتحان
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        هذه الامتحانات للتجربة فقط بعد تفعيل الاشتراك سيفتح كل
                        الامتحانات بشكل كامل
                      </p>
                    </div>

                    <Link href={SUBSCRIPTION_PATH}>
                      <Button className="px-4 py-2 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition font-extrabold">
                        ⭐ فعّل حسابك وافتح المزيد
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teacherExams.slice(0, 6).map((exam, index) => (
                      <div
                        key={exam?._id || index}
                        className="border rounded-2xl p-4 hover:shadow-md transition cursor-pointer bg-blue-50"
                        onClick={() => handleOpenExam(exam?._id)}
                      >
                        <div className="font-extrabold text-gray-900 text-lg">
                          {exam?.examName || "امتحان"}
                        </div>

                        <div className="text-sm text-gray-700 mt-1">
                          📚 {exam?.subject || "—"} • 🧪 {exam?.grade || "—"} •
                          📅 {exam?.term || "—"}
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          🕒 المدة: <b>{exam?.duration || 0}</b> دقيقة • عدد
                          الأسئلة: <b>{exam?.questions?.length || 0}</b>
                        </div>

                        <div className="mt-3">
                          <div className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold">
                            ▶️ بلش الدراسة الآن
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {teacherExams.length > 6 && (
                    <div className="mt-4 flex justify-center">
                      <Link href="/dashboard/subscribed-teachers/6925950db9f708163dd423a7/exams">
                        <Button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                          📌 جرب كل الامتحانات المجانية
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-center">
                    <div className="font-extrabold text-yellow-900">
                      هذه مجرد تجربة مجانية — بعد التفعيل سيفتح لك المزيد من
                      الامتحانات والمواد
                    </div>
                    <div className="mt-3">
                      <Link href={SUBSCRIPTION_PATH}>
                        <button className="rounded-xl bg-yellow-500 px-6 py-3 text-black font-extrabold hover:bg-yellow-400 transition">
                          📦 شاهد الأسعار والباقات
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Locked value preview */}
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">
                      🔒 ماذا سيفتح لك الاشتراك؟
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      هذه الأشياء متاحة بشكل أقوى بعد التفعيل
                    </p>
                  </div>

                  <Link href={SUBSCRIPTION_PATH}>
                    <Button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-extrabold">
                      فعّل الوصول الكامل
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {freeLockedFeatures.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-extrabold text-gray-900">
                          🔒 {item.title}
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white text-xs font-bold text-gray-600 border border-gray-200">
                          متاح بعد التفعيل
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 leading-7">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest result with CTA */}
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    ✅ آخر نتيجة عندك
                  </h2>

                  <Link href={SUBSCRIPTION_PATH}>
                    <Button className="px-4 py-2 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition font-extrabold">
                      افتح كل الامتحانات الآن
                    </Button>
                  </Link>
                </div>

                {latestExamResult ? (
                  <>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-gray-50 border p-3">
                        <div className="text-sm text-gray-500">
                          اسم الامتحان
                        </div>
                        <div className="font-bold text-gray-900">
                          {latestExamTitle}
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50 border p-3">
                        <div className="text-sm text-gray-500">النتيجة</div>
                        <div className="font-extrabold text-blue-700 text-lg">
                          {latestExamResult?._correct ?? 0}/
                          {latestExamResult?._total ?? 0} (
                          {latestExamResult?._percent ?? 0}%)
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50 border p-3">
                        <div className="text-sm text-gray-500">التاريخ</div>
                        <div className="font-bold text-gray-900">
                          {latestExamDate}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-4">
                      <div className="font-extrabold text-blue-900">
                        {freePerformanceMessage}
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row gap-3">
                        <Link href={SUBSCRIPTION_PATH}>
                          <button className="rounded-xl bg-blue-700 px-6 py-3 text-white font-extrabold hover:bg-blue-800 transition">
                            🚀 فعّل حسابك للوصول الكامل
                          </button>
                        </Link>

                        {latestExamResult?._examId ? (
                          <button
                            onClick={() =>
                              handleRetake(latestExamResult?._examId)
                            }
                            className="rounded-xl bg-white px-6 py-3 text-blue-700 font-extrabold border border-blue-200 hover:bg-blue-100 transition"
                          >
                            🔁 أعد هذا الامتحان
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-2xl bg-gray-50 border p-4 text-center">
                    <div className="font-extrabold text-gray-900">
                      لم تقدّم أي امتحان بعد
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-7">
                      ابدأ بأول امتحان مجاني، ثم فعّل الاشتراك للوصول إلى تجربة
                      أوسع تساعدك تدرس بشكل أقوى.
                    </p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/dashboard/subscribed-teachers">
                        <button className="rounded-xl bg-green-500 px-6 py-3 text-white font-extrabold hover:bg-green-600 transition">
                          🚀 ابدأ أول امتحان
                        </button>
                      </Link>

                      <Link href={SUBSCRIPTION_PATH}>
                        <button className="rounded-xl bg-yellow-500 px-6 py-3 text-black font-extrabold hover:bg-yellow-400 transition">
                          ⭐ فعّل الاشتراك
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    لماذا الطلاب يفعّلون اشتراكهم؟
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    آراء مختصرة من طلاب جرّبوا المنصة ثم فعّلوا
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {reviews.map((item, idx) => (
                    <ReviewCard key={idx} name={item.name} text={item.text} />
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    أسئلة سريعة قبل التفعيل
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {faqs.map((item, idx) => (
                    <FAQCard key={idx} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>

              {/* Final CTA */}
              <div className="rounded-2xl bg-gradient-to-l from-blue-700 to-blue-600 text-white p-6 md:p-8 shadow-lg">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="text-2xl md:text-3xl font-extrabold leading-10">
                    جاهز تفتح التجربة الكاملة؟
                  </div>

                  <p className="text-sm md:text-base mt-3 leading-8 text-blue-50">
                    فعّل الآن وابدأ الدراسة بشكل أوضح وأقوى. الحساب المجاني مجرد
                    بداية، أما التفعيل فهو الذي يفتح لك الوصول الحقيقي الذي
                    تحتاجه.
                  </p>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={SUBSCRIPTION_PATH}>
                      <button className="rounded-xl bg-yellow-400 px-7 py-3 text-black font-extrabold hover:bg-yellow-300 transition">
                        📦 فعّل اشتراكك الآن
                      </button>
                    </Link>

                    <a
                      href={`https://wa.me/962${WHATSAPP_NUMBER.replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-white px-7 py-3 text-blue-700 font-extrabold hover:bg-blue-50 transition"
                    >
                      💬 راسلنا واتساب
                    </a>
                  </div>
                </div>
              </div>

              {/* Keep only a lighter chart at the very bottom for free users */}
              {examHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
                  <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                    📊 لمحة سريعة عن أدائك
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    هذا مجرد ملخص مختصر — التفعيل يساعدك تواصل التدريب على عدد
                    أكبر من الامتحانات.
                  </p>

                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={examHistory.slice(-6).map((exam) => ({
                        name:
                          exam?._exam?.subject ||
                          exam?._exam?.examName ||
                          "امتحان",
                        performancePercentage: exam?._percent ?? 0,
                      }))}
                    >
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="performancePercentage" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-4 text-center">
                    <Link href={SUBSCRIPTION_PATH}>
                      <button className="rounded-xl bg-yellow-500 px-6 py-3 text-black font-extrabold hover:bg-yellow-400 transition">
                        ⭐ فعّل وكمّل تدريبك
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && isSubscribed && (
            <>
              {/* Subscribed quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <StatCard
                  title="آخر نتيجة"
                  value={
                    latestExamResult
                      ? `${latestExamResult?._percent ?? 0}%`
                      : "—"
                  }
                  note={latestExamTitle}
                  valueClassName="text-gray-900"
                />

                <StatCard
                  title="متوسط آخر 4 امتحانات"
                  value={`${performanceAverage}%`}
                  note={
                    performanceAverage < 50
                      ? "ابدأ بمراجعة نقاط ضعفك"
                      : performanceAverage < 80
                        ? "ممتاز — كمّل بنفس الوتيرة"
                        : "🔥 أداء قوي جدًا"
                  }
                  valueClassName="text-blue-700"
                />

                <StatCard
                  title="عدد الامتحانات الأخيرة"
                  value={examHistory?.length || 0}
                  note="نعرض آخر 10 نتائج عندك"
                  valueClassName="text-green-700"
                />
              </div>

              {/* Latest exam */}
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
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
                          handleOpenExam(latestExamResult?._examId)
                        }
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-bold"
                      >
                        👀 عرض
                      </button>
                    </div>
                  ) : (
                    <Link href="/dashboard/subscribed-teachers">
                      <Button className="bg-green-500 text-white rounded-xl hover:bg-green-600 font-extrabold">
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
                        {latestExamTitle}
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 border p-3">
                      <div className="text-sm text-gray-500">النتيجة</div>
                      <div className="font-extrabold text-blue-700 text-lg">
                        {latestExamResult?._correct ?? 0}/
                        {latestExamResult?._total ?? 0} (
                        {latestExamResult?._percent ?? 0}%)
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 border p-3">
                      <div className="text-sm text-gray-500">التاريخ</div>
                      <div className="font-bold text-gray-900">
                        {latestExamDate}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-gray-600">
                    ⚠️ لم تقدّم أي امتحان بعد — اضغط “ابدأ امتحان الآن”.
                  </div>
                )}
              </div>

              {/* Exam history */}
              {examHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
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
                          exam?._exam?.examName ||
                          exam?._exam?.subject ||
                          "امتحان";

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
                                onClick={() => handleOpenExam(exam?._examId)}
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
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                  📊 تطور أدائك
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  هذا الرسم يعرض آخر 10 نتائج (كلما زادت الامتحانات، تطلع صورتك
                  أوضح)
                </p>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={examHistory.slice(-10).map((exam) => ({
                      name:
                        exam?._exam?.subject ||
                        exam?._exam?.examName ||
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
