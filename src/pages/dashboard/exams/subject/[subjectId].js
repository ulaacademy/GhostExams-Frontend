import { useRouter } from 'next/router';
import Navbar from '../../../../components/Navbar';

export default function AISubjectPage() {
  const router = useRouter();
  const { subjectId, term, subject } = router.query;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center">
      <Navbar />
      <h1 className="text-3xl font-bold text-purple-700 mb-4">
        🤖 امتحان الذكاء الاصطناعي - {subject}
      </h1>
      <p className="text-lg text-gray-600">📅 الفصل الدراسي: {term}</p>
      <p className="text-lg text-gray-600">🆔 رقم المادة: {subjectId}</p>

      <button
        onClick={() => router.push(`/dashboard/exams/view/AIExamView?subject=${subject}&term=${term}`)}
        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
      >
        🚀 بدء الامتحان
      </button>
    </div>
  );
}
