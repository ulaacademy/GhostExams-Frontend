// src/components/teacher/CourseCard.js
export default function CourseCard({ course }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-blue-700">{course.name}</h3>
      <p className="text-gray-600 mt-1 text-sm">{course.description || "لا يوجد وصف"}</p>
      <div className="mt-3 text-sm text-gray-700">
        عدد الطلاب المسجلين: <span className="font-semibold">{course.studentsCount ?? 0}</span>
      </div>
    </div>
  );
}


