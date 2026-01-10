"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { fetchMixedExams } from "../../../services/api";

export default function MixedExams() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await fetchMixedExams();
        setExams(data);
      } catch (err) {
        setError("❌ فشل في تحميل امتحانات المعلمين");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  if (loading)
    return <p className="text-center">⏳ جاري تحميل الامتحانات...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        📋 امتحانات المعلمين
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white shadow-md rounded p-4 text-center"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {exam.title}
              </h2>
              <p className="text-gray-600">
                تاريخ الامتحان: {new Date(exam.createdAt).toLocaleDateString()}
              </p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  // Navigate to exam view instead of showing alert
                  router.push(`/dashboard/exams/view/MixedExamView?examId=${exam._id}`);
                }}
              >
                عرض الامتحان
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            لا توجد امتحانات متاحة حاليًا.
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/dashboard/exams">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200">
            العودة إلى صفحة الامتحانات
          </button>
        </Link>
      </div>
    </div>
  );
}
