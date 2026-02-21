"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { useAuth } from "@/context/AuthContext";
import {
  fetchStudentPerformance,
  fetchUserExamResults,
} from "@/services/api";

// ✅ تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const QUESTION_FALLBACK = 0;

function calcPercent(correct, total) {
  const c = Number(correct || 0);
  const t = Number(total || 0);
  if (!t) return 0;
  return Math.round((c / t) * 100);
}

// يحاول يفهم score: عدد صحيح ولا نسبة
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

    // score كعدد صحيح
    if (total && s <= total) {
      const correct = s;
      const percent = Number(perf) || calcPercent(correct, total);
      return { correct, total, percent };
    }

    // score كنسبة
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

// بناء Performance حسب نتائج الامتحانات (Fallback)
function buildPerformanceFromResults(results = []) {
  const bySubject = new Map();

  for (const r of results) {
    const subject =
      r?.subject ||
      r?.examSubject ||
      r?._exam?.subject ||
      r?.examName ||
      "غير محدد";

    const { percent } = normalizeScoreAndTotal(r, r?._exam || null);
    if (!bySubject.has(subject)) bySubject.set(subject, []);
    bySubject.get(subject).push(Number(percent || 0));
  }

  // متوسط لكل مادة
  const performance = Array.from(bySubject.entries()).map(([subject, arr]) => {
    const avg =
      arr.length > 0
        ? Math.round(arr.reduce((s, x) => s + (Number(x) || 0), 0) / arr.length)
        : 0;

    return {
      subject,
      performancePercentage: avg,
      averageScore: 0, // ما عندنا متوسط الصف من هذا الـ fallback
    };
  });

  // ترتيب أبجدي (اختياري)
  performance.sort((a, b) => String(a.subject).localeCompare(String(b.subject)));

  return performance;
}

export default function Performance() {
  const { user, userId: authUserId } = useAuth();

  // ✅ userId مرن زي الداشبورد
  const userId =
    authUserId || user?.userId || user?.id || user?._id || null;

  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]); // Array
  const [examHistory, setExamHistory] = useState([]); // Array
  const [recommendations, setRecommendations] = useState([]); // Array
  const [notifications, setNotifications] = useState([]); // Array
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!userId) {
        setLoading(false);
        setError("❌ لم يتم العثور على معرف الطالب. يرجى تسجيل الدخول مرة أخرى.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1) حاول تجيب الأداء الجاهز من الباك
        const perfRes = await fetchStudentPerformance(userId);

        // دعم أكثر من شكل response
        const perf =
          Array.isArray(perfRes) ? perfRes :
          Array.isArray(perfRes?.performance) ? perfRes.performance :
          Array.isArray(perfRes?.data?.performance) ? perfRes.data.performance :
          [];

        const history =
          Array.isArray(perfRes?.examHistory) ? perfRes.examHistory :
          Array.isArray(perfRes?.data?.examHistory) ? perfRes.data.examHistory :
          [];

        const recs =
          Array.isArray(perfRes?.recommendations) ? perfRes.recommendations :
          Array.isArray(perfRes?.data?.recommendations) ? perfRes.data.recommendations :
          [];

        const notes =
          Array.isArray(perfRes?.notifications) ? perfRes.notifications :
          Array.isArray(perfRes?.data?.notifications) ? perfRes.data.notifications :
          [];

        // إذا الأداء فاضي، اعمل fallback من نتائج الامتحانات
        if (!perf || perf.length === 0) {
          const resultsWrap = await fetchUserExamResults(userId);
          const results = Array.isArray(resultsWrap)
            ? resultsWrap
            : resultsWrap?.results || [];

          const builtPerf = buildPerformanceFromResults(results);

          setPerformanceData(builtPerf);
          setExamHistory(results.slice(-20).reverse()); // آخر 20 (الأحدث أولاً)
          setRecommendations([
            "قدّم امتحان جديد يوميًا لتحسين مستواك بسرعة ✅",
            "ركّز على المواد اللي متوسطك فيها أقل من 60% 🎯",
          ]);
          setNotifications([]);
        } else {
          setPerformanceData(perf);
          setExamHistory(history);
          setRecommendations(recs);
          setNotifications(notes);
        }
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات الأداء:", err);

        // fallback أخير: لو فشل الأداء.. حاول على الأقل تجيب نتائج الامتحانات
        try {
          const resultsWrap = await fetchUserExamResults(userId);
          const results = Array.isArray(resultsWrap)
            ? resultsWrap
            : resultsWrap?.results || [];

          const builtPerf = buildPerformanceFromResults(results);

          setPerformanceData(builtPerf);
          setExamHistory(results.slice(-20).reverse());
          setRecommendations([
            "قدّم امتحان جديد يوميًا لتحسين مستواك بسرعة ✅",
            "ركّز على المواد اللي متوسطك فيها أقل من 60% 🎯",
          ]);
          setNotifications([]);
        } catch {
          setError("❌ فشل في تحميل بيانات الأداء. جرّب لاحقًا.");
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [userId]);

  const lineData = useMemo(() => {
    const subjects = (performanceData || []).map((entry) => entry.subject);
    const scores = (performanceData || []).map(
      (entry) => Number(entry.performancePercentage || 0),
    );
    const avgScores = (performanceData || []).map(
      (entry) => Number(entry.averageScore ?? 0),
    );

    return {
      labels: subjects,
      datasets: [
        {
          label: "أداءك (%)",
          data: scores,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
        },
        {
          label: "متوسط الصف (%)",
          data: avgScores,
          fill: false,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [performanceData]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-2xl text-center text-gray-600 font-bold">
          ⏳ جاري تحميل البيانات...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-2xl text-center">
          <div className="text-red-600 font-extrabold mb-3">{error}</div>
          <Link href="/dashboard/studentDashboard">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition">
              العودة إلى الداشبورد
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!performanceData || performanceData.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-2xl text-center text-gray-700">
          ❌ لا توجد بيانات أداء لعرضها.
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/dashboard/exams">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                📚 جرب امتحان جديد
              </button>
            </Link>
            <Link href="/dashboard/studentDashboard">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition">
                العودة للداشبورد
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h1 className="text-2xl font-extrabold text-blue-700">
            📊 أداء الطالب
          </h1>
          <div className="flex gap-2">
            <Link href="/dashboard/subscribed-teachers">
              <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold">
                🚀 ابدأ امتحان
              </button>
            </Link>
            <Link href="/dashboard/studentDashboard">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-bold">
                العودة للداشبورد
              </button>
            </Link>
          </div>
        </div>

        {/* ✅ مقارنة الأداء */}
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">
            🔹 مقارنة أدائك حسب المواد
          </h2>
          <div className="bg-gray-50 border rounded-2xl p-4">
            <Line data={lineData} />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            إذا ما ظهر “متوسط الصف” فهذا طبيعي لو الباك ما يرجّعه (بنخليه 0).
          </p>
        </div>

        {/* ✅ قائمة الامتحانات السابقة */}
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">
            📌 آخر الامتحانات
          </h2>

          {Array.isArray(examHistory) && examHistory.length > 0 ? (
            <ul className="bg-gray-50 border p-4 rounded-2xl space-y-2">
              {examHistory.slice(0, 20).map((exam, index) => {
                const subject =
                  exam?.subject ||
                  exam?._exam?.subject ||
                  exam?.examSubject ||
                  "غير محدد";

                const dateRaw = exam?.date || exam?.createdAt || exam?.updatedAt || null;
                const date = dateRaw ? new Date(dateRaw).toLocaleDateString() : "غير متاح";

                const { correct, total, percent } = normalizeScoreAndTotal(exam, exam?._exam || null);

                return (
                  <li key={index} className="border rounded-xl p-3 bg-white">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-bold text-gray-900">
                        {subject} <span className="text-gray-500 font-normal">• {date}</span>
                      </div>
                      <div className="font-extrabold text-blue-700">
                        {percent}% <span className="text-gray-700 font-normal">({correct}/{total})</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-gray-600 bg-gray-50 border rounded-2xl p-4">
              لا يوجد تاريخ امتحانات بعد.
            </div>
          )}
        </div>

        {/* ✅ التوصيات */}
        {Array.isArray(recommendations) && recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-gray-800 mb-2">
              📢 توصيات سريعة
            </h2>
            <ul className="bg-green-50 border border-green-200 p-4 rounded-2xl space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-green-800 font-bold">
                  ✅ {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ التنبيهات */}
        {Array.isArray(notifications) && notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-gray-800 mb-2">
              ⚠️ تنبيهات
            </h2>
            <ul className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-2">
              {notifications.map((note, index) => (
                <li key={index} className="text-red-700 font-bold">
                  🚨 {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
