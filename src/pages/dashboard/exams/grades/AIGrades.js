import Link from 'next/link';
import Navbar from '../../../../components/Navbar';

export default function AIGrades() {
  const gradeNames = [
    'الصف الرابع', 'الصف الثالث', 'الصف الثاني', 'الصف الأول',
    'الصف الثامن', 'الصف السابع', 'الصف السادس', 'الصف الخامس',
    'الصف الثاني عشر', 'الصف الحادي عشر', 'الصف العاشر', 'الصف التاسع'
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-700">🤖 اختر الصف لاختبار امتحانات الذكاء الاصطناعي</h1>

        <div className="grid grid-cols-4 gap-6 rtl">
          {gradeNames.map((grade, index) => (
            <Link key={index} href={`/dashboard/exams/terms/AITerms?grade=${index + 1}`} passHref>
              <button className="w-48 h-24 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
                {`اختبر امتحانات ${grade}`}
              </button>
            </Link>
          ))}

          <Link href="/dashboard/exams/terms/AITerms?tawjihi=tawjihi-old-science" passHref>
            <button className="w-48 h-24 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300">
              اختبر امتحانات توجيهي نظام قديم - علمي
            </button>
          </Link>

          <Link href="/dashboard/exams/terms/AITerms?tawjihi=tawjihi-old-arts" passHref>
            <button className="w-48 h-24 bg-yellow-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300">
              اختبر امتحانات توجيهي نظام قديم - أدبي
            </button>
          </Link>

          <Link href="/dashboard/exams/terms/AITerms?tawjihi=tawjihi-new" passHref>
            <button className="w-48 h-24 bg-purple-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-purple-600 transition duration-300">
              اختبر امتحانات توجيهي نظام جديد
            </button>
          </Link>
        </div>

        <Link href="/dashboard/exams" passHref>
          <button className="mt-4 px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-300">
            العودة إلى صفحة الامتحانات
          </button>
        </Link>
      </div>
    </div>
  );
} 
