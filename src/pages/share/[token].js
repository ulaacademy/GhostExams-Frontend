"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { viewSharedContent, checkStudentSubscription } from "@/services/api";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SharedContentPage() {
  const router = useRouter();
  const { token } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadSharedContent = async () => {
      try {
        setLoading(true);
        const data = await viewSharedContent(token);
        setShareData(data);
      } catch (err) {
        console.error("❌ فشل في تحميل المحتوى المشترك:", err);
        setError(
          err.response?.data?.message ||
            "❌ رابط المشاركة غير صحيح أو منتهي الصلاحية",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSharedContent();
  }, [token]);

  // Handle Start Exam button click
  const handleStartExam = async () => {
    if (
      !shareData ||
      shareData.share.shareType !== "exam" ||
      !shareData.content
    ) {
      return;
    }

    const content = shareData.content;
    const examId = content._id;
    const teacherId = content.teacherId?._id || content.teacherId;

    // Step 1: Check authentication
    const storedToken = localStorage.getItem("token");
    const isAuthenticated = !!(storedToken && user);

    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = `/share/${token}`;
      router.push({
        pathname: "/auth/Login",
        query: {
          redirect: returnUrl,
          message: "يجب تسجيل الدخول لبدء الامتحان",
        },
      });
      return;
    }

    // Step 2: Check subscription
    if (!teacherId) {
      setError("❌ لا يمكن العثور على معلومات المعلم");
      return;
    }

    try {
      setCheckingSubscription(true);
      const subscriptionResult = await checkStudentSubscription(token);

      if (!subscriptionResult.isSubscribed) {
        // Get teacherId from result or content
        const resultTeacherId = subscriptionResult.teacher?._id || teacherId;

        // Redirect to teachers page with message
        router.push({
          pathname: "/ourteachers",
          query: {
            teacherId: resultTeacherId,
            message: "يجب الاشتراك مع المعلم للوصول إلى هذا الامتحان",
          },
        });
        return;
      }

      // Step 3: If authenticated and subscribed, navigate to exam page
      router.push(`/dashboard/exams/custom/${examId}`);
    } catch (err) {
      console.error("❌ فشل في التحقق من الاشتراك:", err);
      setError(
        err.response?.data?.message || "❌ حدث خطأ أثناء التحقق من الاشتراك",
      );
    } finally {
      setCheckingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              ⏳ جاري تحميل المحتوى المشترك...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <p className="text-red-600 text-xl mb-4">❌ {error}</p>
            <Link href="/">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                العودة للصفحة الرئيسية
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return null;
  }

  const { share, sharedBy, content } = shareData;

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-32">
        {/* ✅ Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔗</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">محتوى مشترك</h1>
              <p className="text-sm text-gray-600">
                تمت المشاركة بواسطة: {sharedBy?.name || "مستخدم"}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              📅 تاريخ المشاركة:{" "}
              {new Date(share.createdAt).toLocaleDateString("ar-SA")}
            </span>
            <span>👁️ عدد المشاهدات: {share.accessCount}</span>
            {share.expiresAt && (
              <span>
                ⏰ ينتهي في:{" "}
                {new Date(share.expiresAt).toLocaleDateString("ar-SA")}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Exam Content - Introduction Screen */}
        {share.shareType === "exam" && content && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📘</div>
              <h2 className="text-3xl font-bold text-blue-700 mb-2">
                {content.examName}
              </h2>
              <p className="text-gray-600">امتحان مشترك من المعلم</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">📚 المادة</p>
                <p className="font-semibold text-lg">{content.subject}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">🧪 الصف</p>
                <p className="font-semibold text-lg">{content.grade}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">📅 الفصل</p>
                <p className="font-semibold text-lg">{content.term}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">🕒 المدة</p>
                <p className="font-semibold text-lg">
                  {content.duration} دقيقة
                </p>
              </div>
            </div>

            {content.teacherId && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">👩‍🏫 المعلم:</p>
                <p className="font-semibold text-lg">
                  {content.teacherId.name}
                </p>
                {content.teacherId.subjects &&
                  content.teacherId.subjects.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      المواد: {content.teacherId.subjects.join("، ")}
                    </p>
                  )}
              </div>
            )}

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                📋 معلومات الامتحان
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  • عدد الأسئلة:{" "}
                  <span className="font-semibold">
                    {content.questions?.length || 0} سؤال
                  </span>
                </li>
                <li>
                  • مدة الامتحان:{" "}
                  <span className="font-semibold">
                    {content.duration} دقيقة
                  </span>
                </li>
                <li>• يجب أن تكون مشتركاً مع المعلم لبدء الامتحان</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartExam}
                disabled={checkingSubscription}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkingSubscription ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    <span>ابدأ الامتحان</span>
                  </>
                )}
              </button>
              <Link href="/ourteachers">
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition w-full">
                  👩‍🏫 تصفح المعلمين
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ✅ Teacher Profile Content */}
        {share.shareType === "teacher_profile" && content && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              {content.profileImage ? (
                <img
                  src={content.profileImage}
                  alt={content.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl">
                  👩‍🏫
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {content.name}
                </h2>
                <p className="text-gray-600">{content.email}</p>
              </div>
            </div>

            {content.subjects && content.subjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  📚 المواد التي يدرسها:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {content.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link href={`/ourteachers`}>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                  ✅ اشترك مع هذا المعلم
                </button>
              </Link>
              <Link href="/">
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  🏠 الصفحة الرئيسية
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ✅ Exam Result Content */}
        {share.shareType === "exam_result" && content && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">
              📊 نتيجة امتحان
            </h2>

            {content.examId && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  {content.examId.examName}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>📚 المادة: {content.examId.subject}</p>
                  <p>🧪 الصف: {content.examId.grade}</p>
                  <p>📅 الفصل: {content.examId.term}</p>
                </div>
              </div>
            )}

            <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white text-center">
              <p className="text-sm mb-2">النتيجة</p>
              <p className="text-5xl font-bold">{content.score}%</p>
              <p className="text-sm mt-2">
                {content.score} من {content.totalQuestions} إجابة صحيحة
              </p>
            </div>

            {content.studentId && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الطالب:</p>
                <p className="font-semibold">{content.studentId.name}</p>
              </div>
            )}

            {content.teacherId && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">المعلم:</p>
                <p className="font-semibold">{content.teacherId.name}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/dashboard/studentDashboard">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  📊 لوحة التحكم
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
