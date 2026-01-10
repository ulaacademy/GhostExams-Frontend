import { useRouter } from "next/router";

export default function SchoolSubjectPage() {
  const router = useRouter();
  const { subjectId, term, subject } = router.query;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        📖 امتحان {subject}
      </h1>
      <p className="text-lg text-gray-600">📅 الفصل الدراسي: {term}</p>
      <p className="text-lg text-gray-600">🆔 رقم المادة: {subjectId}</p>
    </div>
  );
}
