"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { showWarning } from "@/utils/toastHelper";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      const hasToken = !!(storedToken || token);
      const hasUser = !!user;

      setIsAuthenticated(hasToken && hasUser);
      setIsStudent(user?.role === "student");
    };

    checkAuth();

    // Re-check when user or token changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [user, token]);

  // Handle dashboard link clicks for unauthenticated users
  const handleDashboardClick = (e, href) => {
    if (!isAuthenticated || !isStudent) {
      e.preventDefault();
      showWarning("يجب تسجيل الدخول كطالب للوصول إلى هذه الصفحة");
      router.push({
        pathname: "/auth/Login",
        query: {
          redirect: href,
          message: "loginRequired",
        },
      });
    }
  };

  // Get dashboard URL with userId if authenticated
  const getDashboardUrl = (basePath) => {
    if (isAuthenticated && isStudent && user) {
      const userId = user?._id || user?.id || user?.userId;
      return userId ? `${basePath}?userId=${userId}` : basePath;
    }
    return basePath;
  };

  return (
    <nav className="bg-gray-800 text-white p-4 fixed w-full top-0 left-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-center items-center space-x-8 flex-wrap">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer"
        >
          GHOST EXAMS
        </Link>

        {/* Public Links - Always Visible */}
        <Link href="/" className="hover:text-gray-300 cursor-pointer">
          صفحة الطلاب
        </Link>

        <Link href="/pricing" className="hover:text-gray-300 cursor-pointer">
          صفحة المعلمين 📌
        </Link>

        <Link href="/chat/" className="hover:text-gray-300 cursor-pointer">
          الذكي Ai معلم 🤖
        </Link>

        <Link
          href="/calculator/"
          className="hover:text-gray-300 cursor-pointer"
        >
          حاسبة المعدل 🎛️
        </Link>

        {/* Authentication Links */}
        {!isAuthenticated ? (
          <>
            <Link
              href="/auth/Login"
              className="hover:text-gray-300 cursor-pointer"
            >
              الدخول 🔁
            </Link>
            <Link
              href="/auth/Register"
              className="hover:text-gray-300 cursor-pointer"
            >
              مستخدم جديد 👇
            </Link>
          </>
        ) : (
          <>
            {/* Student Dashboard Links - Only for authenticated students */}
            {isStudent && (
              <>
                <Link
                  href={getDashboardUrl("/dashboard/studentDashboard")}
                  className="hover:text-gray-300 cursor-pointer"
                >
                  لوحة التحكم 🎛️
                </Link>
              </>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="hover:text-gray-300 cursor-pointer"
            >
              تسجيل الخروج 🚪
            </button>
          </>
        )}

        {/* Dashboard Links for Unauthenticated Users - Redirect to Login */}
        {!isAuthenticated && (
          <>
            <span
              onClick={(e) => handleDashboardClick(e, "/dashboard/exams")}
              className="hover:text-gray-300 cursor-pointer opacity-75"
              title="يجب تسجيل الدخول"
            >
              امتحانات طلاب 📋
            </span>
            <span
              onClick={(e) => handleDashboardClick(e, "/dashboard/settings")}
              className="hover:text-gray-300 cursor-pointer opacity-75"
              title="يجب تسجيل الدخول"
            >
              اخبار طلاب ⚙️
            </span>
            <span
              onClick={(e) => handleDashboardClick(e, "/dashboard/simulation")}
              className="hover:text-gray-300 cursor-pointer opacity-75"
              title="يجب تسجيل الدخول"
            >
              محاكاة الامتحانات الوزارية 📝
            </span>
          </>
        )}
      </div>
    </nav>
  );
}
