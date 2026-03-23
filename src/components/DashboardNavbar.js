"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { fetchMyStudentSubscriptionStatus } from "@/services/api";

/* =========================
   ✅ روابط المواد الأربعة
========================= */
const SUBJECT_ITEMS = [
  {
    id: "subject-english",
    href: "/dashboard/subscribed-teachers/6945bd19f63cff3e4bd2d854/exams",
    label: "🤝 انجليزي",
    icon: "🇬🇧",
  },
  {
    id: "subject-arabic",
    href: "/dashboard/subscribed-teachers/6945bfcd43cff502c645f5ee/exams",
    label: "🤝 عربي",
    icon: "📘",
  },
  {
    id: "subject-islamic",
    href: "/dashboard/subscribed-teachers/6945cbc643cff502c6460873/exams",
    label: "🤝 دين",
    icon: "🕌",
  },
  {
    id: "subject-history",
    href: "/dashboard/subscribed-teachers/695c379a76bfebc62783b4a5/exams",
    label: "🤝 تاريخ",
    icon: "🏛️",
  },
];

/* =========================
   ✅ Top Navbar items
========================= */
const TOP_ACTIVE_ITEMS = SUBJECT_ITEMS.map((item) => ({
  ...item,
  id: `top-${item.id}`,
}));

const TOP_FREE_ITEMS = [
  {
    id: "top-subscription",
    href: "/dashboard/student/subscription",
    label: "📦 الحزم والاشتراك",
    icon: "📦",
  },
  {
    id: "top-activate-english",
    href: "/dashboard/student/subscription",
    label: "فعل إنجليزي",
    icon: "🇬🇧",
  },
  {
    id: "top-activate-arabic",
    href: "/dashboard/student/subscription",
    label: "فعل عربي",
    icon: "📘",
  },
  {
    id: "top-activate-islamic",
    href: "/dashboard/student/subscription",
    label: "فعل دين",
    icon: "🕌",
  },
  {
    id: "top-activate-history",
    href: "/dashboard/student/subscription",
    label: "فعل تاريخ",
    icon: "🏛️",
  },
  {
    id: "top-activate-whatsapp",
    href: "https://wa.link/ghostexams",
    label: "فعل حسابك ",
    icon: "💬",
    external: true,
  },
];

/* =========================
   ✅ Sidebar items
========================= */
const SIDEBAR_ACTIVE_ITEMS = [
  {
    id: "sidebar-dashboard",
    href: "/dashboard/studentDashboard",
    label: "لوحة التحكم",
    icon: "📌",
  },
  {
    id: "sidebar-chat",
    href: "/dashboard/chat",
    label: "الشات الذكي",
    icon: "💬",
  },
  {
    id: "sidebar-calculator",
    href: "/dashboard/calculator",
    label: "حاسبة المعدل",
    icon: "🧮",
  },
  {
    id: "sidebar-subject-english",
    href: "/dashboard/subscribed-teachers/6945bd19f63cff3e4bd2d854/exams",
    label: "إنجليزي",
    icon: "🇬🇧",
  },
  {
    id: "sidebar-subject-arabic",
    href: "/dashboard/subscribed-teachers/6945bfcd43cff502c645f5ee/exams",
    label: "عربي",
    icon: "📘",
  },
  {
    id: "sidebar-subject-islamic",
    href: "/dashboard/subscribed-teachers/6945cbc643cff502c6460873/exams",
    label: "دين",
    icon: "🕌",
  },
  {
    id: "sidebar-subject-history",
    href: "/dashboard/subscribed-teachers/695c379a76bfebc62783b4a5/exams",
    label: "تاريخ",
    icon: "🏛️",
  },
  ];

const SIDEBAR_FREE_ITEMS = [
  {
    id: "sidebar-subscription",
    href: "/dashboard/student/subscription",
    label: "الحزم والاشتراك",
    icon: "📦",
  },
  {
    id: "sidebar-banks",
    href: "/ourteachers",
    label: "بنوك الاسئلة",
    icon: "🤝",
  },
  {
    id: "sidebar-activate-english",
    href: "/dashboard/student/subscription",
    label: "فعل إنجليزي",
    icon: "🇬🇧",
  },
  {
    id: "sidebar-activate-arabic",
    href: "/dashboard/student/subscription",
    label: "فعل عربي",
    icon: "📘",
  },
  {
    id: "sidebar-activate-islamic",
    href: "/dashboard/student/subscription",
    label: "فعل دين",
    icon: "🕌",
  },
  {
    id: "sidebar-activate-history",
    href: "/dashboard/student/subscription",
    label: "فعل تاريخ",
    icon: "🏛️",
  },
  {
    id: "sidebar-activate-whatsapp",
    href: "https://wa.link/ghostexams",
    label: "فعل حسابك",
    icon: "💬",
    external: true,
  },
];

/* =========================
   ✅ Safe token read
========================= */
function getTokenSafe(tokenFromCtx) {
  if (tokenFromCtx) return tokenFromCtx;
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

const DashboardNavbar = ({ children, student = {} }) => {
  const router = useRouter();
  const { logout, user, token } = useAuth();
  const { name = "الطالب", email = "" } = student;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* =========================
     ✅ Auth
  ========================= */
  const [accessToken, setAccessToken] = useState("");
  useEffect(() => {
    setAccessToken(getTokenSafe(token));
  }, [token]);

  const isAuthenticated = !!user && !!accessToken;

  /* =========================
     ✅ Subscription status
  ========================= */
  const [subStatus, setSubStatus] = useState({
    loading: true,
    active: null,
    pending: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setSubStatus({ loading: false, active: null, pending: null });
        }
        return;
      }

      try {
        const data = await fetchMyStudentSubscriptionStatus();

        if (cancelled) return;

        setSubStatus({
          loading: false,
          active: data?.activeSubscription || null,
          pending: data?.pendingSubscription || null,
        });
      } catch {
        if (!cancelled) {
          setSubStatus({ loading: false, active: null, pending: null });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  /* =========================
     ✅ Access rules
  ========================= */
  const isSubscribed = !!subStatus.active;
  const canAccessAll = isAuthenticated && isSubscribed;
  const isGuest = !isAuthenticated;

  /* =========================
     ✅ Menus
  ========================= */
  const topNavItemsToRender = useMemo(() => {
    return canAccessAll ? TOP_ACTIVE_ITEMS : TOP_FREE_ITEMS;
  }, [canAccessAll]);

  const sidebarItemsToRender = useMemo(() => {
    return canAccessAll ? SIDEBAR_ACTIVE_ITEMS : SIDEBAR_FREE_ITEMS;
  }, [canAccessAll]);

  const goSubscribe = () => {
    setMobileSidebarOpen(false);
    router.push("/dashboard/student/subscription");
  };

  /* =========================
     ✅ Shared render helpers
  ========================= */
  const renderLinkContent = (item) => (
    <>
      {!!item.icon && <span className="text-lg">{item.icon}</span>}
      <span className="flex-1">{item.label}</span>
    </>
  );

  const renderSidebarItem = (item) => {
    const isActive =
      !!item.href &&
      item.href !== "#" &&
      !item.external &&
      router.pathname.startsWith(item.href);

    const baseClasses =
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition w-full text-right";

    const stateClasses = isActive
      ? "bg-blue-100 text-blue-700"
      : "text-gray-700 hover:bg-gray-100";

    if (isGuest) {
      return (
        <button
          type="button"
          onClick={goSubscribe}
          className={`${baseClasses} text-gray-400 cursor-not-allowed`}
          title="سجّل/اشترك لتفعيل"
        >
          {renderLinkContent(item)}
          <span className="text-sm">🔒</span>
        </button>
      );
    }

    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${stateClasses} text-orange-500 hover:bg-orange-50`}
        >
          {renderLinkContent(item)}
        </a>
      );
    }

    return (
      <Link href={item.href} className={`${baseClasses} ${stateClasses}`}>
        {renderLinkContent(item)}
      </Link>
    );
  };

  const renderTopItem = (item) => {
    const isActive =
      !!item.href &&
      item.href !== "#" &&
      !item.external &&
      router.pathname.startsWith(item.href);

    if (isGuest) {
      return (
        <button
          type="button"
          onClick={goSubscribe}
          className="text-white/60 font-medium cursor-not-allowed"
          title="سجّل/اشترك لتفعيل"
        >
          {item.label} 🔒
        </button>
      );
    }

    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-300 font-medium transition hover:text-orange-200"
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link
        href={item.href}
        className={`text-white font-medium transition ${
          isActive ? "underline underline-offset-4" : "hover:text-gray-200"
        }`}
      >
        {item.label}
      </Link>
    );
  };

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

            <div className="mt-3">
              {subStatus.loading && isAuthenticated ? (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  ⏳ جاري التحقق من الاشتراك...
                </span>
              ) : canAccessAll ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ✅ اشتراك فعّال
                </span>
              ) : isGuest ? (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  🔒 زائر
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  ⚠️ حساب مجاني
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto pr-1">
            <ul className="space-y-2">
              {sidebarItemsToRender.map((item) => (
                <li key={item.id}>{renderSidebarItem(item)}</li>
              ))}
            </ul>

            {!canAccessAll && !isGuest && (
              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  🔒 المواد + الشات + الحاسبة بتفتح بعد تفعيل الاشتراك.
                </p>
                <button
                  type="button"
                  onClick={goSubscribe}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  📦 فعّل الاشتراك
                </button>
              </div>
            )}
          </nav>

          {isAuthenticated && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
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
                <h1 className="text-white text-lg font-bold hover:opacity-90">
                  📌 لوحة تحكم الطالب
                </h1>
              </Link>
            </div>

            {/* ✅ Desktop title */}
            <Link
              href="/dashboard/studentDashboard"
              className="hidden md:inline-block"
            >
              <h1 className="text-white text-lg font-bold hover:opacity-90">
                📌 لوحة تحكم الطالب
              </h1>
            </Link>

            <ul className="flex flex-wrap gap-4 md:gap-6">
              {topNavItemsToRender.map((item) => (
                <li key={item.id}>{renderTopItem(item)}</li>
              ))}
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
                    {sidebarItemsToRender.map((item) => (
                      <li key={`mobile-${item.id}`}>
                        {isGuest ? (
                          <button
                            type="button"
                            onClick={goSubscribe}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-gray-400 cursor-not-allowed w-full text-right"
                          >
                            {!!item.icon && (
                              <span className="text-lg">{item.icon}</span>
                            )}
                            <span className="flex-1">{item.label}</span>
                            <span className="text-sm">🔒</span>
                          </button>
                        ) : item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-orange-500 hover:bg-orange-50 w-full"
                          >
                            {!!item.icon && (
                              <span className="text-lg">{item.icon}</span>
                            )}
                            <span className="flex-1">{item.label}</span>
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setMobileSidebarOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-gray-700 hover:bg-gray-100 w-full"
                          >
                            {!!item.icon && (
                              <span className="text-lg">{item.icon}</span>
                            )}
                            <span className="flex-1">{item.label}</span>
                          </Link>
                        )}
                      </li>
                    ))}
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
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
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