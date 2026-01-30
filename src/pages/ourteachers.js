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
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              {renderAvatar(teacher, index)}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {teacher.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {teacher.planName
                    ? `الباقة الحالية: ${teacher.planName}`
                    : "الباقة الحالية: غير محددة"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  console.log("TEACHER OBJECT:", teacher);
                  console.log("TEACHER KEYS:", Object.keys(teacher || {}));
                  handleShareTeacher(teacher.id, e);
                }}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                title="مشاركة ملف المعلم"
              >
                🔗 مشاركة
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-2 flex-1">
              <p>
                <span className="font-semibold text-gray-700">المواد:</span>{" "}
                {teacher.subjects?.length
                  ? teacher.subjects.join("، ")
                  : "غير متاحة"}
              </p>
              <p>
                <span className="font-semibold text-gray-700">
                  الطلاب المسجلون:
                </span>{" "}
                {teacher.maxStudents > 0
                  ? `${(Number(teacher.currentStudents) || 0) + 277} / ${teacher.maxStudents}`
                  : `${(Number(teacher.currentStudents) || 0) + 1} طالب`}
              </p>

              {/* ✅ عدد الامتحانات */}
              <p>
                <span className="font-semibold text-gray-700">
                  عدد الامتحانات:
                </span>{" "}
                {Number(teacher.examsCount) || 0} امتحان
              </p>

              {/* ✅ عدد الأسئلة */}
              <p>
                <span className="font-semibold text-gray-700">
                  عدد الأسئلة:
                </span>{" "}
                {Number(teacher.questionsCount) || 0} سؤال
              </p>

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
              <div className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
                You cannot subscribe to this teacher because they have reached
                the maximum number of students allowed. The teacher needs to
                upgrade their plan.
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSubscribe(teacher)}
              disabled={
                subscribeLoading === teacher.id ||
                teacher.isFull ||
                (!isStudent && Boolean(user))
              }
              className={`mt-4 w-full rounded-lg py-2 font-semibold transition ${
                teacher.isFull
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } ${
                subscribeLoading === teacher.id ? "opacity-75 cursor-wait" : ""
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
          </div>
        ))}
      </div>
    );
  };

  // ✅ Main content component (reusable for both layouts)
  const MainContent = () => (
    <main
      className={`pt-8 pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto ${
        isAuthenticated ? "" : "mt-20"
      }`}
    >
      <section className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          👩‍🏫 معلمونا المميزون
        </h1>
        <p className="mt-3 text-gray-600 max-w-3xl mx-auto">
          اختر المعلم المناسب لك من بين نخبة المعلمين المشتركين في الخطط النشطة.
          يمكنك الاشتراك فوراً إذا كان هناك مقعد متاح في خطتهم الحالية.
        </p>
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>معلمونا | منصة الشبح</title>
        <meta
          name="description"
          content="استعرض أفضل المعلمين على منصة الشبح واشترك مباشرة مع معلمك المفضل وفق خطط مرنة."
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
