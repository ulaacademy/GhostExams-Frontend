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

  // ✅ NEW: mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // ✅ NEW: Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    router.events?.on("routeChangeStart", handleRouteChange);
    return () => router.events?.off("routeChangeStart", handleRouteChange);
  }, [router.events]);

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

  // ✅ NEW: helper to close menu
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-gray-800 text-white fixed w-full top-0 left-0 z-50 shadow-md">
      <div className="h-[72px] px-4">
        <div className="container mx-auto h-full flex items-center justify-between">
          {/* ✅ Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer whitespace-nowrap"
          >
            GHOST EXAMS
          </Link>

          {/* ✅ Desktop Menu (md+) */}
          <div className="hidden md:flex items-center gap-6">
            {/* Public Links - Always Visible */}
            <Link href="/" className="hover:text-gray-300 cursor-pointer">
              صفحة الطلاب 📌
            </Link>

            <Link
              href="/pricing"
              className="hover:text-gray-300 cursor-pointer"
            >
              صفحة المعلمين 📌
            </Link>

            <Link
              href="/ourteachers/"
              className="hover:text-gray-300 cursor-pointer"
            >
              معلمونا 👩‍🏫
            </Link>

            <Link href="/chat/" className="hover:text-gray-300 cursor-pointer">
              الذكي Ai شات 🤖
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
                  <Link
                    href={getDashboardUrl("/dashboard/studentDashboard")}
                    className="hover:text-gray-300 cursor-pointer"
                  >
                    لوحة التحكم 🎛️
                  </Link>
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
              <span
                onClick={(e) =>
                  handleDashboardClick(e, "/dashboard/simulation")
                }
                className="hover:text-gray-300 cursor-pointer opacity-75"
                title="يجب تسجيل الدخول"
              >
                محاكاة الامتحانات الوزارية 📝
              </span>
            )}
          </div>

          {/* ✅ Mobile Button (below md) */}
          <button
            type="button"
            className="md:hidden text-2xl font-bold"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            القائمة☰
          </button>
        </div>
      </div>

      {/* ✅ Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-gray-900 text-white shadow-xl">
            <div className="h-[72px] px-4 flex items-center justify-between border-b border-white/10">
              <span className="font-bold text-yellow-400">القائمة</span>
              <button
                type="button"
                className="text-2xl"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-72px)]">
              {/* Public Links */}
              <Link
                href="/"
                onClick={closeMobile}
                className="block px-3 py-2 rounded hover:bg-white/10"
              >
                صفحة الطلاب
              </Link>

              <Link
                href="/pricing"
                onClick={closeMobile}
                className="block px-3 py-2 rounded hover:bg-white/10"
              >
                صفحة المعلمين 📌
              </Link>

              <Link
                href="/ourteachers/"
                className="hover:text-gray-300 cursor-pointer"
              >
                معلمونا 👩‍🏫
              </Link>

              <Link
                href="/chat/"
                onClick={closeMobile}
                className="block px-3 py-2 rounded hover:bg-white/10"
              >
                الذكي Ai شات 🤖
              </Link>

              <Link
                href="/calculator/"
                onClick={closeMobile}
                className="block px-3 py-2 rounded hover:bg-white/10"
              >
                حاسبة المعدل 🎛️
              </Link>

              <div className="my-3 border-t border-white/10" />

              {/* Auth Links */}
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/auth/Login"
                    onClick={closeMobile}
                    className="block px-3 py-2 rounded hover:bg-white/10"
                  >
                    الدخول 🔁
                  </Link>
                  <Link
                    href="/auth/Register"
                    onClick={closeMobile}
                    className="block px-3 py-2 rounded hover:bg-white/10"
                  >
                    مستخدم جديد 👇
                  </Link>
                </>
              ) : (
                <>
                  {isStudent && (
                    <Link
                      href={getDashboardUrl("/dashboard/studentDashboard")}
                      onClick={closeMobile}
                      className="block px-3 py-2 rounded hover:bg-white/10"
                    >
                      لوحة التحكم 🎛️
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      closeMobile();
                      logout();
                    }}
                    className="w-full text-right block px-3 py-2 rounded hover:bg-white/10"
                  >
                    تسجيل الخروج 🚪
                  </button>
                </>
              )}

              {/* Unauthenticated dashboard link */}
              {!isAuthenticated && (
                <button
                  onClick={(e) => {
                    handleDashboardClick(e, "/dashboard/simulation");
                    closeMobile();
                  }}
                  className="w-full text-right block px-3 py-2 rounded hover:bg-white/10 opacity-90"
                  title="يجب تسجيل الدخول"
                >
                  محاكاة الامتحانات الوزارية 📝
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
