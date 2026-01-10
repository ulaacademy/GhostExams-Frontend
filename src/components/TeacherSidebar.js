// src/components/TeacherSidebar.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function TeacherSidebar({ teacherName }) {
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/teacher", icon: "🏠" },
    { name: "Students", path: "/teacher/students", icon: "🎓" },
    { name: "Exams", path: "/teacher/exams", icon: "📄" },
    { name: "Performance", path: "/teacher/performance", icon: "📈" },
    // { name: "Analytics", path: "/teacher/analytics", icon: "📊" },
    // { name: "Courses", path: "/teacher/courses", icon: "📚" },
    { name: "Reports", path: "/teacher/reports", icon: "📝" },
    { name: "Subscription", path: "/teacher/subscription", icon: "💳" },
    { name: "Sub Status", path: "/teacher/subscription-status", icon: "📋" },
    // { name: "Settings", path: "/teacher/settings", icon: "⚙️" },
  ];

  return (
    <div className="h-screen bg-white shadow-lg flex flex-col justify-between p-4 border-r">
      {/* 🔵 عنوان ExamTracker */}
      <div>
        <h2 className="text-3xl font-extrabold text-blue-600 text-center mb-8">
          ExamTracker
        </h2>

        {/* 🧭 قائمة التنقل */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer text-lg transition 
                  ${
                    router.pathname === item.path
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-blue-100"
                  }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* 👤 معلومات المعلم */}
      <div className="p-4 border-t mt-4">
        <div className="text-center mb-4">
          <div className="text-gray-900 font-bold text-lg">{teacherName || "Teacher"}</div>
          <div className="text-gray-500 text-sm mt-1">Teacher</div>
        </div>
        
        {/* 🚪 زر تسجيل الخروج */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
