// src/components/TeacherLayout.js
import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout({ children, teacherName }) {
  return (
    <div className="flex min-h-screen">
      {/* ✅ السايدبار الثابت */}
      <div className="w-64">
        <TeacherSidebar teacherName={teacherName} />
      </div>

      {/* ✅ محتوى الصفحة المتغير */}
      <div className="flex-1 bg-gray-50 p-6">
        {children}
      </div>
    </div>
  );
}
