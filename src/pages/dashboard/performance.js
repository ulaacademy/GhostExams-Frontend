"use client";
import { useState, useEffect } from "react";
import { Line} from "react-chartjs-2";
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
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ✅ تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Performance() {
  const { user } = useAuth(); // ✅ جلب المستخدم الحالي
  const [performanceData, setPerformanceData] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      const userId = user?._id;
      if (!userId) return;

      try {
        const response = await axios.get(
          `/api/student-performance?userId=${userId}`
        );
        setPerformanceData(response.data.performance);
        setExamHistory(response.data.examHistory);
        setRecommendations(response.data.recommendations);
        setNotifications(response.data.notifications);
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات الأداء:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [user]); // ✅ نعيد التحديث إذا تغير المستخدم

  if (loading)
    return (
      <div className="text-center text-gray-600">⏳ جاري تحميل البيانات...</div>
    );

  if (!performanceData || performanceData.length === 0)
    return (
      <div className="text-center text-gray-600">
        ❌ لا توجد بيانات أداء لعرضها.
      </div>
    );

  // 🔹 تحضير بيانات المخططات بعد التأكد من وجود البيانات
  const subjects = performanceData.map((entry) => entry.subject);
  const scores = performanceData.map((entry) => entry.performancePercentage);
  const avgScores = performanceData.map((entry) => entry.averageScore ?? 0); // احتياطًا لو ما فيه متوسط

  const lineData = {
    labels: subjects,
    datasets: [
      {
        label: "أداء الطالب (%)",
        data: scores,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      },
      {
        label: "متوسط زملائه (%)",
        data: avgScores,
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          📊 أداء الطالب
        </h1>

        {/* ✅ مقارنة الأداء */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            🔹 مقارنة الأداء
          </h2>
          <Line data={lineData} />
        </div>

        {/* ✅ قائمة الامتحانات السابقة */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            📌 الامتحانات السابقة
          </h2>
          <ul className="bg-gray-200 p-4 rounded-lg">
            {examHistory.map((exam, index) => (
              <li key={index} className="border-b py-2">
                {exam.subject} - {exam.date} -{" "}
                <strong>
                  {exam.score} / {exam.totalQuestions}
                </strong>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ التوصيات */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            📢 التوصيات
          </h2>
          <ul className="bg-green-100 p-4 rounded-lg">
            {recommendations.map((rec, index) => (
              <li key={index} className="py-2">
                ✅ {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ التنبيهات */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              ⚠️ تنبيهات هامة
            </h2>
            <ul className="bg-red-100 p-4 rounded-lg">
              {notifications.map((note, index) => (
                <li key={index} className="py-2">
                  🚨 {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ روابط */}
        <div className="mt-6 flex justify-between">
          <Link href="/dashboard/studentDashboard">
            <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200">
              العودة إلى الداشبورد
            </button>
          </Link>

          <Link href="/dashboard/exams">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
              📚 جرب امتحان جديد
            </button>
          </Link>
        </div> 
      </div>
    </div>
  );
}
