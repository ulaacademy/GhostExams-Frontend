"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import axios from "axios";
import { useRouter } from "next/router";
import { showWarning } from "@/utils/toastHelper";

export default function SchoolTerms() {
  const [selectedTerm, setSelectedTerm] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const currentGrade = router.query.grade || ""; // ✅ التقاط الصف من الرابط
    setGrade(currentGrade);

    console.log("📌 الصف المختار:", currentGrade);

    // ✅ تحديث قائمة المواد الدراسية
    setSubjects([
      { name: "الرياضيات", id: "math" },
      { name: "اللغة العربية", id: "arabic" },
      { name: "اللغة الإنجليزية", id: "english" },
      { name: "التربية الإسلامية", id: "islamic" },
      { name: "العلوم", id: "science" },
      { name: "الفيزياء", id: "physics" },
      { name: "الكيمياء", id: "chemistry" },
      { name: "الأحياء", id: "biology" },
      { name: "التاريخ", id: "history" },
      { name: "الجغرافيا", id: "geography" },
      { name: "التربية الوطنية", id: "national-education" },
    ]);
  }, [router.isReady, router.query.grade]);

  const handleSubjectClick = async (subjectId) => {
    if (!selectedTerm || !grade) {
      showWarning("يرجى اختيار الفصل الدراسي والصف قبل المتابعة");
      return;
    }

    setLoading(true);
    try {
      const userId = "67afb1473ebf342cdb026709";
      const response = await axios.post(
        "https://ge-api.ghostexams.com/api/exams/generate-school-exam",
        {
          grade,
          term: selectedTerm,
          subject: subjectId,
          userId,
        }
      );

      if (response.data.exam && response.data.exam._id) {
        // ✅ ✅ ✅ 🔥 تم إنشاء الامتحان بنجاح، يتم توجيه الطالب إلى صفحة عرض الامتحان
        router.push(
          `/dashboard/exams/view/SchoolExamView?examId=${response.data.exam._id}&grade=${grade}&term=${selectedTerm}&subject=${subjectId}`
        );
      } else {
        // Error is already handled by axios interceptor (Toast shown)
      }
    } catch (error) {
      // Error is already handled by axios interceptor (Toast shown)
      console.error("❌ خطأ أثناء إنشاء الامتحان:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-700">
          📚 اختر الفصل الدراسي المناسب
        </h1>
        <p className="text-gray-600">قم باختيار الفصل لتفعيل المواد</p>

        {/* ✅ زر اختيار الفصل الدراسي */}
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedTerm("term1")}
            className={`w-48 h-20 ${
              selectedTerm === "term2"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
            disabled={selectedTerm === "term2"}
          >
            📖 الفصل الدراسي الأول
          </button>

          <button
            onClick={() => setSelectedTerm("term2")}
            className={`w-48 h-20 ${
              selectedTerm === "term1"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
            disabled={selectedTerm === "term1"}
          >
            📖 الفصل الدراسي الثاني
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mt-6">
          🎯 اختر المادة التي ترغب باختبار أسئلتها
        </h2>

        {/* ✅ عرض المواد الدراسية مع الروابط الصحيحة */}
        <div className="grid grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectClick(subject.id)}
              className={`w-48 h-20 ${
                selectedTerm && grade
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-300 cursor-not-allowed"
              } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
              disabled={!selectedTerm || !grade}
            >
              {subject.name}
            </button>
          ))}
        </div>

        <Link href="/dashboard/exams/grades/SchoolGrades" passHref>
          <button className="mt-4 px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-300">
            ⬅️ العودة إلى صفحة اختيار الصفوف
          </button>
        </Link>
      </div>
    </div>
  );
}
