"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  API_URL,
  fetchSubscribedTeachers,
  createShareLink,
} from "@/services/api";
import { showToast } from "@/components/Toast";
//import Image from "next/image";

export default function SubscribedTeachersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModals, setShareModals] = useState({});
  const [shareUrls, setShareUrls] = useState({});

  // ✅ جلب المعلمين المشترك معهم
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSubscribedTeachers();
        setTeachers(data || []);
      } catch (err) {
        // Error is already handled by axios interceptor (Toast shown, redirect if 401)
        // Just set local error state for UI
        console.error("❌ فشل في جلب المعلمين:", err);

        // Check if it's an authentication error (401)
        if (err.response?.status === 401 || !localStorage.getItem("token")) {
          // ProtectedRoute will handle redirect, just set error state
          setError("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
          return;
        }

        // For other errors, show user-friendly message
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "فشل في تحميل المعلمين المشترك معهم";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Only load if user is authenticated (ProtectedRoute ensures this, but double-check)
    if (user && localStorage.getItem("token")) {
      loadTeachers();
    }
  }, [user]);

  // ✅ الانتقال إلى صفحة امتحانات المعلم
  const handleViewExams = (teacherId) => {
    router.push(`/dashboard/subscribed-teachers/${teacherId}/exams`);
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

      setShareUrls((prev) => ({
        ...prev,
        [`teacher_${teacherId}`]: result.share.url,
      }));
      setShareModals((prev) => ({ ...prev, [`teacher_${teacherId}`]: true }));
    } catch (error) {
      // ✅ الخطأ سيظهر تلقائياً عبر Toast من axios interceptor
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

  // ✅ تنسيق نوع الاشتراك
  const getSubscriptionTypeLabel = (type) => {
    const labels = {
      free: "مجاني",
      basic: "أساسي",
      premium: "مميز",
    };
    return labels[type] || type;
  };

  // ✅ تنسيق نوع الاشتراك مع لون
  const getSubscriptionTypeColor = (type) => {
    const colors = {
      free: "bg-gray-100 text-gray-700",
      basic: "bg-blue-100 text-blue-700",
      premium: "bg-purple-100 text-purple-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const studentDetails = {
    name: user?.name || "الطالب",
    email: user?.email || "",
  };

  const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

  const buildImageUrl = (p) => {
    if (!p) return null;
    if (p.startsWith("data:")) return p;
    if (p.startsWith("http")) return p;
    return `${API_ORIGIN}/${p.replace(/^\/+/, "")}`;
  };

  return (
    <ProtectedRoute requiredRole="student">
      <DashboardNavbar student={studentDetails}>
        <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">
            🤝 المعلمون المشترك معهم
          </h1>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">⏳ جاري تحميل المعلمين...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                ⚠️ لم يتم الاشتراك مع أي معلم حتى الآن.
              </p>
              <button
                onClick={() => router.push("/ourteachers")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                تصفح المعلمين
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  {/* ✅ بطاقة المعلم */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {teacher.profileImage ? (
                          <img
                            src={buildImageUrl(teacher.profileImage)}
                            alt={teacher.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                            👩‍🏫
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {teacher.name}
                            {teacher.isGhostTeacher && (
                              <span
                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                                title="معلم افتراضي"
                              >
                                👻 معلم افتراضي
                              </span>
                            )}
                          </h3>
                          {teacher.subjects && teacher.subjects.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              📚 المواد: {teacher.subjects.join("، ")}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${getSubscriptionTypeColor(
                                teacher.subscriptionType
                              )}`}
                            >
                              {getSubscriptionTypeLabel(
                                teacher.subscriptionType
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleShareTeacher(teacher._id, e)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                          title="مشاركة ملف المعلم"
                        >
                          🔗 مشاركة
                        </button>
                        <button
                          onClick={() => handleViewExams(teacher._id)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                        >
                          <span>📚 عرض الامتحانات</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Modals للمشاركة */}
          {Object.keys(shareModals).map((key) => {
            if (!shareModals[key]) return null;
            const url = shareUrls[key];
            return (
              <div
                key={key}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                dir="rtl"
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold mb-4">🔗 رابط المشاركة</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      انسخ الرابط وشاركه:
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
                      setShareModals((prev) => ({ ...prev, [key]: false }))
                    }
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardNavbar>
    </ProtectedRoute>
  );
}
