import Link from "next/link";
import Navbar from "../../../../components/StudentsNavbar";

export default function TeacherGrades() {
  const grades = [
    {
      name: "2009 الصف العاشر",
      description: "اختبر امتحانات الصف العاشر للعام 2009.",
      link: "/dashboard/exams/terms/TeacherTerms?grade=10",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "توجيهي 2007 - علمي",
      description:
        "امتحانات توجيهي (العلمي) جيل 2007. اكثر من 5 الاف سؤال لطلاب 2007 ",
      link: "/dashboard/exams/terms/TeacherTerms?grade=2007",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "توجيهي 2007 - أدبي",
      description:
        "امتحانات توجيهي (الادبي ) جيل 2007. اكثر من 2 الفين سؤال لطلاب 2007 ",
      link: "/dashboard/exams/terms/TeacherTerms?grade=20072",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      name: "توجيهي 2008 - نظام جديد",
      description:
        "امتحانات التوجيهي الجديدة لعام 2008. اكثر من 5 الاف سؤال لطلاب 2008",
      link: "/dashboard/exams/terms/TeacherTerms?grade=2008",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 rtl">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-6 space-y-8">
        {/* ✅ النص التوضيحي الرئيسي بتنسيق أفضل */}
        <div className="text-center text-gray-900 mt-10">
          <h2 className="text-3xl font-extrabold">
            📌 من هنا تبدأ أفضل نهاية للعام الدراسي الطويل والدراسة المكثفة
          </h2>
          <p className="text-xl font-bold mt-4">
            ✅ اختبر نفسك وتأكد أنك في أمان - امتحانات وأسئلة في أكبر بنك أسئلة
            في الأردن، أكثر من{" "}
            <span className="text-blue-600 font-extrabold">10,000 سؤال!</span>
          </p>
        </div>

        {/* ✅ شبكة البطاقات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {grades.map((grade, index) => (
            <Link key={index} href={grade.link} passHref>
              <div
                className={`w-80 h-48 p-6 rounded-xl shadow-lg text-white flex flex-col justify-center items-center cursor-pointer transition duration-300 ${grade.color}`}
              >
                <h2 className="text-2xl font-extrabold">{grade.name}</h2>
                <p className="text-md text-gray-200 text-center mt-3">
                  {grade.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* ✅ زر العودة */}
        <Link href="/dashboard/exams" passHref>
          <button className="mt-8 px-8 py-4 bg-gray-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
            ⬅️ العودة إلى صفحة الامتحانات
          </button>
        </Link>
      </div>
    </div>
  );
}
