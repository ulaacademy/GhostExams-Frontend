import Link from "next/link";

export default function GradeSelection() {
  const grades = [
    "الصف الأول",
    "الصف الثاني",
    "الصف الثالث",
    "الصف الرابع",
    "الصف الخامس",
    "الصف السادس",
    "الصف السابع",
    "الصف الثامن",
    "الصف التاسع",
    "الصف العاشر",
    "الصف الحادي عشر",
    "الصف الثاني عشر",
    "توجيهي نظام قديم",
    "توجيهي نظام جديد",
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        اختر الصف الدراسي
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grades.map((grade, index) => (
          <Link
            key={index}
            href={`/dashboard/exams/term-selection?grade=${encodeURIComponent(
              grade
            )}`}
          >
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
              {grade}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
