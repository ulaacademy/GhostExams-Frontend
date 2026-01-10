"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard/exams/teacher", label: "🏫 امتحانات المعلمين" },
  { href: "/dashboard/exams/school", label: "📚 امتحانات المدرسة" },
  { href: "/dashboard/exams/grades/BooksGrades", label: "📖 امتحانات الكتب" },
  { href: "/dashboard/exams/ai", label: "🤖 امتحانات الذكاء الاصطناعي" },
  { href: "/dashboard/simulation", label: "🏛️ امتحانات الوزارية Simulation" },
  { href: "/ourteachers", label: "👩‍🏫 معلمونا" },
];

const SIDEBAR_ITEMS = [
  {
    href: "/dashboard/studentDashboard",
    label: "لوحة التحكم",
    icon: "📌",
  },

  // ✅ جديد: الحزم والاشتراك (ثاني خيار تحت لوحة التحكم)
  {
    href: "/dashboard/student/subscription",
    label: "الحزم والاشتراك",
    icon: "📦",
  },

  {
    href: "/dashboard/subscribed-teachers",
    label: "المعلمون المشترك معهم",
    icon: "🤝",
  },
  {
    href: "/ourteachers",
    label: "معلمو المنصة",
    icon: "👩‍🏫",
  },
  {
    href: "/dashboard/exams/teacher",
    label: "امتحانات المعلمين",
    icon: "🏫",
  },
  {
    href: "/dashboard/exams/school",
    label: "امتحانات المدرسة",
    icon: "🏫",
  },
  {
    href: "/dashboard/exams/grades/BooksGrades",
    label: "امتحانات الكتب",
    icon: "📖",
  },
  {
    href: "/dashboard/exams/ai",
    label: "امتحانات الذكاء الاصطناعي",
    icon: "🤖",
  },
  {
    href: "/dashboard/simulation",
    label: "امتحانات الوزارية Simulation",
    icon: "🏛️",
  },
  {
    href: "/dashboard/exams/ghost",
    label: "امتحانات Ghost Examinations",
    icon: "👻",
  },
  {
    label: "الشات الذكي",
    icon: "💬",
  },
];

const DashboardNavbar = ({ children, student = {} }) => {
  const router = useRouter();
  const { logout, user, token } = useAuth();
  const { name = "الطالب", email = "" } = student;

  // Check if user is authenticated
  const isAuthenticated = !!(user && (token || localStorage.getItem("token")));

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ✅ ثابت: خلي السايدبار بطول الشاشة */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 shadow-sm h-screen sticky top-0">
        {/* ✅ خلي المحتوى flex-col بطول كامل */}
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

          {/* ✅ مهم: خلي القائمة هي اللي تعمل Scroll */}
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

          {/* ✅ ثابت تحت: زر الخروج ما عاد يختفي */}
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
        <nav className="bg-blue-600 p-4 shadow-lg">
          <div className="container mx-auto flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <h1 className="text-white text-lg font-bold">
              📌 لوحة تحكم الطالب
            </h1>
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

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardNavbar;
