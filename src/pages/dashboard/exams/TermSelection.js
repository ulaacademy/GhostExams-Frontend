"use client";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";

export default function TermSelection() {
  const router = useRouter();
  const { grade } = router.query;

  useEffect(() => {
    // ✅ إعادة توجيه المستخدم إذا لم يتم تحديد الصف
    if (!grade) {
      router.push("/dashboard/exams/grades/SchoolGrades"); // تأكد من صحة الرابط
    }
  }, [grade, router]); // ✅ إضافة 'router' كمُتغير تابع

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        📚 اختر الفصل الدراسي
      </h1>

      <div className="flex justify-center space-x-4">
        <Link
          href={`/dashboard/exams/subject-selection?grade=${encodeURIComponent(
            grade
          )}&term=term1`}
        >
          <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300">
            الفصل الدراسي الأول
          </button>
        </Link>

        <Link
          href={`/dashboard/exams/subject-selection?grade=${encodeURIComponent(
            grade
          )}&term=term2`}
        >
          <button className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition duration-300">
            الفصل الدراسي الثاني
          </button>
        </Link>
      </div>
    </div>
  );
}
