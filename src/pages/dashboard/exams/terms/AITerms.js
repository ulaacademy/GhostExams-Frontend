"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import { fetchExamsByCriteria } from "../../../../services/api";

export default function AITerms() {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [exams, setExams] = useState([]);

  const subjects = [
    "الرياضيات",
    "اللغة العربية",
    "اللغة الإنجليزية",
    "التربية الإسلامية",
    "العلوم",
    "الفيزياء",
    "الكيمياء",
    "الأحياء",
    "التاريخ",
    "الجغرافيا",
    "التربية الوطنية",
  ];

  useEffect(() => {
    if (selectedTerm) {
      const fetchExams = async () => {
        try {
          const examsData = await fetchExamsByCriteria(
            "ai",
            "grade-1",
            selectedTerm,
            "all"
          );
          setExams(examsData);
        } catch (error) {
          console.error("❌ خطأ في جلب الامتحانات:", error);
        }
      };
      fetchExams();
    }
  }, [selectedTerm]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-700">
          📚 اختر الفصل الدراسي المناسب
        </h1>
        <p className="text-lg text-gray-600">قم باختيار الفصل لتفعيل المواد</p>

        <div className="flex space-x-4">
          <button
            className={`w-48 h-16 ${
              selectedTerm === "term2"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
            onClick={() => setSelectedTerm("term1")}
            disabled={selectedTerm === "term2"}
          >
            الفصل الدراسي الأول
          </button>

          <button
            className={`w-48 h-16 ${
              selectedTerm === "term1"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
            onClick={() => setSelectedTerm("term2")}
            disabled={selectedTerm === "term1"}
          >
            الفصل الدراسي الثاني
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mt-6">
          🎯 اختر المادة التي ترغب باختبار أسئلتها
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <Link
              key={index}
              href={
                selectedTerm
                  ? `/dashboard/exams/view/AIExamView?term=${selectedTerm}&subject=${encodeURIComponent(subject)}`
                  : "#"
              }
              passHref
            >
              <button
                className={`w-48 h-20 ${
                  selectedTerm
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
                disabled={!selectedTerm}
              >
                {subject}
              </button>
            </Link>
          ))}
        </div>

        <div className="mt-4">
          {exams.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-700 mt-4">
                📄 الامتحانات المتوفرة:
              </h3>
              <ul className="list-disc pl-5">
                {exams.map((exam) => (
                  <li key={exam._id} className="text-gray-800">
                    {exam.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link href="/dashboard/exams/grades/AIGrades" passHref>
          <button className="mt-4 px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-300">
            العودة إلى صفحة الصفوف
          </button>
        </Link>
      </div>
    </div>
  );
}
