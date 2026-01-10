"use client";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Head from "next/head";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Exams() {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
        <Navbar />

      <Head>
        <title>منصة الشبح | امتحانات توجيهي لطلاب 2007 و 2008</title>
        <meta
          name="description"
          content="منصة الشبح التعليمية تقدم آلاف الأسئلة التفاعلية، مراجعات يومية، وامتحانات وزارية ذكية لطلاب التوجيهي الأردني 2007 و2008 و2009."
        />
        <meta
          name="keywords"
          content="توجيهي, توجيهي الأردن, توجيهي 2007, توجيهي 2008, امتحانات وزارية, امتحان عربي وزاري, امتحان رياضيات علمي, اسئلة وزارية, اسئلة سنوات سابقة"
        />
      </Head>

      {/* ✅ الجملة العلوية مع تحسين المسافات */}
      <div className="text-center mt-20 mb-8 px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-black leading-relaxed mt-[7vh]">
          الخطوة الأخيرة هي سبب الفرحة الكبيرة !!{" "}
          <span className="text-blue-600">
            احنا سبب فرحتك، امتحن وانت مرتاح
          </span>
        </h1>
      </div>

      {/* ✅ تصميم الكاردات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-5xl p-6">
        <div className="col-span-full bg-white border border-dashed border-blue-400 text-blue-700 rounded-2xl shadow-sm p-6 text-center">
          <p className="text-2xl font-semibold">
            📝 محاكاة الامتحانات الوزارية <span className="block text-gray-600 text-lg mt-2">سوف يتوفر قريبًا</span>
          </p>
        </div>

        <Link href="/dashboard/exams/grades/SchoolGrades" passHref>
          <div className="bg-green-500 text-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-3xl font-bold">🏫 امتحانات مدرسية</h2>
            <p className="text-lg mt-2 text-gray-100">
              اختبر نفسك بامتحانات المدارس الفعلية.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/exams/grades/TeacherGrades" passHref>
          <div className="bg-yellow-500 text-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-3xl font-bold">👩‍🏫 امتحانات معلمين النخبة</h2>
            <p className="text-lg mt-2 text-gray-100">
              اختبر نفسك بامتحانات أفضل المعلمين.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/exams/grades/BooksGrades" passHref>
          <div className="bg-blue-500 text-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-3xl font-bold">📚 امتحانات الكتب المدرسية</h2>
            <p className="text-lg mt-2 text-gray-100">
              امتحانات مستخرجة مباشرة من الكتب.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/exams/grades/MixedGrades" passHref>
          <div className="bg-purple-500 text-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-3xl font-bold">🤖 امتحانات ذكاء اصطناعي</h2>
            <p className="text-lg mt-2 text-gray-100">
              جرب أقوى امتحانات الذكاء الاصطناعي.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/exams/grades/MinistryGrades" passHref>
          <div className="bg-purple-500 text-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-3xl font-bold">🤖 امتحانات </h2>
            <p className="text-lg mt-2 text-gray-100">جرب أقوى امتحانات .</p>
          </div>
        </Link>
      </div>

      {/* ✅ زر العودة */}
      <Link href="/" passHref>
        <button className="mt-10 px-8 py-4 bg-gray-700 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
          🔙 العودة إلى الصفحة الرئيسية
        </button>
      </Link>
    </div>
    </ProtectedRoute>
  );
}
