"use client";

import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import Navbar from "@/components/Navbar";
import {
  fetchActiveTeachersWithPlans,
  subscribeToTeacher,
  fetchUserId,
  createShareLink,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/components/Toast";
import { useRouter } from "next/router";

const EMPTY_AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
];

export default function OurTeachersPage() {
  const { user, userId, token } = useAuth();
  const router = useRouter();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [subscribeLoading, setSubscribeLoading] = useState(null);
  const [resolvedStudentId, setResolvedStudentId] = useState(null);
  const [shareModals, setShareModals] = useState({});
  const [shareUrls, setShareUrls] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isStudent = user?.role === "student";

  // ✅ Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      const hasToken = !!(storedToken || token);
      const hasUser = !!user;
      setIsAuthenticated(hasToken && hasUser);
    };

    checkAuth();

    // Re-check when user or token changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [user, token]);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActiveTeachersWithPlans();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error("❌ فشل تحميل قائمة المعلمين:", loadError);
      setError("❌ حدث خطأ أثناء تحميل قائمة المعلمين. حاول مرة أخرى لاحقًا.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  useEffect(() => {
    if (!isStudent) {
      setResolvedStudentId(null);
      return;
    }

    if (userId) {
      setResolvedStudentId(userId);
      return;
    }

    // كحل احتياطي لجلب المعرف إذا لم يكن موجودًا في الـ context
    fetchUserId()
      .then((id) => {
        if (id) {
          setResolvedStudentId(id);
        }
      })
      .catch((fetchError) => {
        console.error("❌ خطأ أثناء استرجاع هوية الطالب:", fetchError);
      });
  }, [isStudent, userId]);

  const handleSubscribe = async (teacher) => {
    // ✅ إذا المستخدم مش مسجّل دخول -> ودّيه على تسجيل طالب
    if (!token || !user) {
      router.push("/auth/Register");
      return;
    }

    if (teacher.isFull) {
      setFeedback({
        type: "error",
        message:
          "You cannot subscribe to this teacher because they have reached the maximum number of students allowed. The teacher needs to upgrade their plan.",
      });
      return;
    }

    if (!isStudent) {
      setFeedback({
        type: "error",
        message: "يرجى تسجيل الدخول كطالب للاشتراك لدى المعلمين.",
      });
      return;
    }

    if (!resolvedStudentId) {
      setFeedback({
        type: "error",
        message:
          "لم يتم التعرف على حساب الطالب. يرجى إعادة تسجيل الدخول والمحاولة مجددًا.",
      });
      return;
    }

    try {
      setSubscribeLoading(teacher.id);
      setFeedback(null);

      const response = await subscribeToTeacher({
        teacherId: teacher.id,
        studentId: resolvedStudentId,
        type: "basic",
      });

      setFeedback({
        type: "success",
        message: response?.message || "✅ تم الاشتراك بنجاح لدى المعلم.",
      });

      await loadTeachers();
    } catch (subscribeError) {
      console.error("❌ خطأ أثناء الاشتراك:", subscribeError);
      const errorMessage =
        subscribeError?.message ||
        subscribeError?.error ||
        (typeof subscribeError === "string"
          ? subscribeError
          : "❌ فشل الاشتراك. حاول مرة أخرى.");

      setFeedback({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setSubscribeLoading(null);
    }
  };

  // ✅ مشاركة ملف المعلم
  const handleShareTeacher = async (teacherId, e) => {
    e.stopPropagation();

    try {
      const result = await createShareLink({
        shareType: "teacher_profile",
        resourceId: teacherId,
        expiresInDays: 30,
      });

      setShareUrls((prev) => ({ ...prev, [teacherId]: result.share.url }));
      setShareModals((prev) => ({ ...prev, [teacherId]: true }));
    } catch (error) {
      // Error is already handled by axios interceptor (Toast shown)
      console.error("❌ فشل في إنشاء رابط المشاركة:", error);
    }
  };

  // ✅ نسخ الرابط
  const copyToClipboard = (url) => {
    if (url) {
      navigator.clipboard.writeText(url);
      showToast("✅ تم نسخ الرابط بنجاح", "success");
    }
  };

  const resolveTeacherImage = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }
    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
    const baseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://ge-api.ghostexams.com";
    return `${baseUrl}${normalizedPath}`;
  }, []);

  const renderAvatar = (teacher, index) => {
    const imageUrl = resolveTeacherImage(teacher.image);

    if (imageUrl) {
      return (
        <Image
          src={imageUrl}
          alt={teacher.name}
          width={64}
          height={64}
          sizes="64px" // ✅ تحسين موبايل/LCP بدون تغيير أي شيء بصري
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          priority={index < 3}
          unoptimized={imageUrl.startsWith("data:")}
        />
      );
    }

    const color = EMPTY_AVATAR_COLORS[index % EMPTY_AVATAR_COLORS.length];
    const initials = teacher.name
      ? teacher.name
          .split(" ")
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase()
      : "T";

    return (
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${color}`}
      >
        {initials}
      </div>
    );
  };

  const renderTeachers = () => {
    if (loading) {
      return (
        <div className="text-center text-gray-600 py-12">
          🔄 جاري تحميل قائمة المعلمين...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 py-12 font-medium">
          {error}
        </div>
      );
    }

    if (!teachers.length) {
      return (
        <div className="text-center text-gray-600 py-12">
          لا يوجد معلمون متاحون في الوقت الحالي. الرجاء العودة لاحقًا.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher, index) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition flex flex-col"
          >
            {/* ✅ Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="shrink-0">{renderAvatar(teacher, index)}</div>

                <div className="min-w-0 flex-1">
                  {/* ✅ الاسم سطر واحد */}
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    {teacher.name}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                      🧪 {Number(teacher.examsCount) || 0} امتحان
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-100">
                      📚 {Number(teacher.questionsCount) || 0} سؤال
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Body */}
            <div className="p-5 flex-1">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-gray-500 shrink-0">
                    المواد:
                  </span>
                  <span className="text-gray-800 text-right">
                    {teacher.subjects?.length
                      ? teacher.subjects.join("، ")
                      : "غير متاحة"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-gray-500 shrink-0">
                    الطلاب المسجلون:
                  </span>
                  <span className="text-gray-800 text-right">
                    {teacher.maxStudents > 0
                      ? `${(Number(teacher.currentStudents) || 0) + 1999} / ${teacher.maxStudents}`
                      : `${(Number(teacher.currentStudents) || 0) + 1} طالب`}
                  </span>
                </div>

                {teacher.maxStudents === 0 && (
                  <p className="text-xs text-gray-500">
                    لا يوجد حد أقصى لعدد طلاب هذه الخطة.
                  </p>
                )}

                {teacher.bio && (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {teacher.bio}
                  </p>
                )}
              </div>

              {teacher.isFull && (
                <div className="mt-4 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl p-3">
                  You cannot subscribe to this teacher because they have reached
                  the maximum number of students allowed. The teacher needs to
                  upgrade their plan.
                </div>
              )}
            </div>

            {/* ✅ Footer (زر الاشتراك + زر المشاركة تحت) */}
            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => handleSubscribe(teacher)}
                disabled={
                  subscribeLoading === teacher.id ||
                  teacher.isFull ||
                  (!isStudent && Boolean(user))
                }
                className={`w-full rounded-xl py-2.5 font-semibold transition ${
                  teacher.isFull
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${
                  subscribeLoading === teacher.id
                    ? "opacity-75 cursor-wait"
                    : ""
                }`}
              >
                {teacher.isFull
                  ? "مكتمل العدد"
                  : subscribeLoading === teacher.id
                    ? "جاري الاشتراك..."
                    : isStudent
                      ? "اشترك لدى المعلم"
                      : "تسجيل الدخول للاشتراك"}
              </button>

              <button
                onClick={(e) => {
                  console.log("TEACHER OBJECT:", teacher);
                  console.log("TEACHER KEYS:", Object.keys(teacher || {}));
                  handleShareTeacher(teacher.id, e);
                }}
                className="mt-3 w-full px-4 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition text-sm font-semibold"
                title="مشاركة ملف المعلم"
              >
                🔗 مشاركة ملف البنك
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ✅ Main content component (reusable for both layouts)
  const MainContent = () => (
    <main
      dir="rtl"
      className={`pt-8 pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto ${
        isAuthenticated ? "" : "mt-20"
      }`}
    >
      <section className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          بنوك الاسئلة المتوفرة لطلاب 2009
        </h1>
        <p className="mt-3 text-gray-600 max-w-3xl mx-auto">
          اكبر واحدث بنوك اسئلة تم كتابتها بأدق التفاصيل ، حسب المنهاج المعتمد ،
          تحاكي النمط الوزاري ومدعومة بالذكاء الاصطناعي الحقيقي
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
            ✅ امتحانات تفاعلية مع نتائج فورية
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-100">
            ✅ منظم حسب المادة والفصل والوحدة
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-100">
            ✅ بنك أسئلة شامل لكل المادة فصلين
          </span>

          <span className="px-3 py-1.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
            ✅ اكثر من 120+ امتحان
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-100">
            ✅ اكثر من 8000+ سؤال
          </span>
        </div>
      </section>

      {feedback && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm sm:text-base ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {renderTeachers()}

      {/* ✅ Modals للمشاركة */}
      {Object.keys(shareModals).map((teacherId) => {
        if (!shareModals[teacherId]) return null;
        const url = shareUrls[teacherId];
        return (
          <div
            key={teacherId}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            dir="rtl"
            role="dialog" // ✅ وصولية/SEO غير مباشر
            aria-modal="true"
            aria-label="مشاركة رابط المعلم"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">🔗 رابط مشاركة المعلم</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  انسخ الرابط وشاركه مع طلاب آخرين:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url || ""}
                    readOnly
                    className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                    aria-label="رابط المشاركة"
                  />
                  <button
                    onClick={() => copyToClipboard(url)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    📋 نسخ
                  </button>
                </div>
              </div>
              <button
                onClick={() =>
                  setShareModals((prev) => ({ ...prev, [teacherId]: false }))
                }
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        );
      })}
    </main>
  );

  // ✅ SEO values (بدون أي تغيير على الواجهة)
  const pageTitle = "بنوك الأسئلة والامتحانات | منصة الشبح";
  const pageDescription =
    "استعرض بنوك الأسئلة للمعلمين على منصة الشبح لطلاب توجيهي 2009 واشترك مباشرة مع معلمك المفضل وفق خطط مرنة.";
  const pageKeywords =
    "بنوك اسئلة, توجيهي 2009, بنك اسئلة, امتحانات تفاعلية, منصة الشبح, GhostExams, معلمون, خطط اشتراك";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ghostexams.com"; // ✅ غيّرها لو عندك دومين مختلف
  const canonicalUrl = `${siteUrl}${router?.asPath?.split("?")[0] || ""}`;

  // ✅ Schema (JSON-LD) بدون تأثير بصري
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    inLanguage: "ar",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        {/* ✅ Mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ✅ Basic SEO */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content="ar_AR" />

        {/* ✅ Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* ✅ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      {/* ✅ Conditional Layout Rendering */}
      {isAuthenticated ? (
        // ✅ Logged-in users: Use DashboardNavbar (current behavior)
        <DashboardNavbar
          student={{ name: user?.name || "الطالب", email: user?.email || "" }}
        >
          <MainContent />
        </DashboardNavbar>
      ) : (
        // ✅ Not logged in: Use public Navbar (public website theme)
        <>
          <Navbar />
          <MainContent />
        </>
      )}
    </div>
  );
}
