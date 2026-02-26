"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

// ✅ Top Navbar (بدون الامتحانات)
const NAV_ITEMS = [
  { href: "/dashboard/subscribed-teachers", label: " 🤝 الامتحانات" },
  { href: "/ourteachers", label: " 🤝 بنوك الاسئلة" },
];

const SIDEBAR_ITEMS = [
  {
    href: "/dashboard/studentDashboard",
    label: "لوحة التحكم",
    icon: "📌",
  },
  {
    href: "/dashboard/student/subscription",
    label: "الحزم والاشتراك",
    icon: "📦",
  },
  {
    href: "/dashboard/subscribed-teachers",
    label: " الامتحانات",
    icon: "🤝",
  },
  {
    href: "/ourteachers",
    label: " اضف بنوك الاسئلة",
    icon: "🤝",
  },
   {
  href: "/dashboard/chat",
    label: "الشات الذكي",
    icon: "💬",
  },
  {
  href: "/dashboard/calculator",
  label: "حاسبة المعدل",
  icon: "🧮",
},
];

const DashboardNavbar = ({ children, student = {} }) => {
  const router = useRouter();
  const { logout, user, token } = useAuth();
  const { name = "الطالب", email = "" } = student;

  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const isAuthenticated = !!(user && (token || localStorage.getItem("token")));

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ✅ Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 shadow-sm h-screen sticky top-0">
        <div className="flex flex-col h-full w-full p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500">مرحباً بك</p>
            <h2 className="text-lg font-semibold text-gray-800 leading-tight">
              {name} - لوحة الطالب
            </h2>
            {email && (
              <p className="text-sm text-gray-500 mt-1 break-words">{email}</p>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto pr-1">
            <ul className="space-y-2">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive =
                  item.href && router.pathname.startsWith(item.href);

                const baseClasses =
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
                const stateClasses = isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100";

                if (item.href) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`${baseClasses} ${stateClasses}`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <span
                      className={`${baseClasses} text-gray-400 cursor-not-allowed`}
                      aria-disabled="true"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </nav>

          {isAuthenticated && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white"
              >
                🚪 تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* ✅ Top Navbar */}
        <nav className="bg-blue-600 p-4 shadow-lg">
          <div className="container mx-auto flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            {/* ✅ Mobile */}
            <div className="flex items-center justify-between md:hidden">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="text-white text-2xl font-bold"
                aria-label="Open sidebar"
              >
                القائمة ☰
              </button>

              <Link href="/dashboard/studentDashboard" className="inline-block">
                <h1 className="text-white text-lg font-bold cursor-pointer hover:opacity-90">
                  📌 لوحة تحكم الطالب
                </h1>
              </Link>
            </div>

            {/* ✅ Desktop title */}
            <Link
              href="/dashboard/studentDashboard"
              className="inline-block hidden md:inline-block"
            >
              <h1 className="text-white text-lg font-bold cursor-pointer hover:opacity-90">
                📌 لوحة تحكم الطالب
              </h1>
            </Link>

            <ul className="flex flex-wrap gap-4 md:gap-6">
              {NAV_ITEMS.map((item) => {
                const isActive = router.pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`text-white font-medium transition ${
                        isActive
                          ? "underline underline-offset-4"
                          : "hover:text-gray-200"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* ✅ Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
              <div className="flex flex-col h-full w-full p-6">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">مرحباً بك</p>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                      {name} - لوحة الطالب
                    </h2>
                    {email && (
                      <p className="text-sm text-gray-500 mt-1 break-words">
                        {email}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="text-2xl text-gray-700"
                    aria-label="Close sidebar"
                  >
                    ✕
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto pr-1">
                  <ul className="space-y-2">
                    {SIDEBAR_ITEMS.map((item) => {
                      const isActive =
                        item.href && router.pathname.startsWith(item.href);

                      const baseClasses =
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
                      const stateClasses = isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100";

                      if (item.href) {
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileSidebarOpen(false)}
                              className={`${baseClasses} ${stateClasses}`}
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        );
                      }

                      return (
                        <li key={item.label}>
                          <span
                            className={`${baseClasses} text-gray-400 cursor-not-allowed`}
                            aria-disabled="true"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {isAuthenticated && (
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white"
                    >
                      🚪 تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardNavbar;
