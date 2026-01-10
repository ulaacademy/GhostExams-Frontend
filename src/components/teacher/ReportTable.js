// src/components/teacher/ReportTable.js
export default function ReportTable({ rows = [] }) {
  if (!rows || rows.length === 0) {
    return <p className="text-gray-600">⚠️ لا توجد تقارير متاحة حاليا.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-2 px-4 border-b text-right">📘 المادة</th>
            <th className="py-2 px-4 border-b text-right">📄 الامتحان</th>
            <th className="py-2 px-4 border-b text-right">👨‍🎓 عدد الطلاب</th>
            <th className="py-2 px-4 border-b text-right">📊 متوسط النتيجة</th>
            <th className="py-2 px-4 border-b text-right">📅 آخر تحديث</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="text-center hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{r.subject || "-"}</td>
              <td className="py-2 px-4 border-b">{r.examName || "-"}</td>
              <td className="py-2 px-4 border-b">{r.studentsCount ?? 0}</td>
              <td className="py-2 px-4 border-b">{Math.round(r.averageScore ?? 0)}%</td>
              <td className="py-2 px-4 border-b">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('ar-SA') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


