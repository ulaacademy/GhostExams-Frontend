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
        console.error("❌ فشل في جلب المعلمين:", err);

        if (err.response?.status === 401 || !localStorage.getItem("token")) {
          setError("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
          return;
        }

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "فشل في تحميل المعلمين المشترك معهم";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

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
        <div dir="rtl" className="max-w-6xl mx-auto">
          {/* ✅ Header Card */}
          <div className="bg-white p-5 md:p-6 shadow-md rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-blue-600">
                🤝 البنوك المشترك معهم
              </h1>

              {/* CTA سريع */}
              <button
                onClick={() => router.push("/dashboard/studentDashboard")}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-semibold w-full md:w-auto"
              >
                ➕ إضافة معلم جديد
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-600">⏳ جاري تحميل المعلمين...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">
                  ⚠️ لم يتم الاشتراك مع أي معلم حتى الآن.
                </p>
                <button
                  onClick={() => router.push("/ourteachers")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  تصفح البنوك
                </button>
              </div>
            ) : (
              <>
                {/* ✅ Stats صغيرة */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    عدد البنوك: {teachers.length}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    اضغط على “عرض الامتحانات” للدخول لامتحانات البنك
                  </span>
                </div>

                {/* ✅ GRID Cards */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher._id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      {/* ✅ Top strip */}
                      <div className="px-4 pt-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          {teacher.profileImage ? (
                            <img
                              src={buildImageUrl(teacher.profileImage)}
                              alt={teacher.name}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                              👩‍🏫
                            </div>
                          )}

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-gray-800 truncate">
                                {teacher.name}
                              </h3>
                              {teacher.isGhostTeacher && (
                                <span
                                  className="text-[11px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                                  title="معلم افتراضي"
                                >
                                  👻 افتراضي
                                </span>
                              )}
                            </div>

                            {teacher.subjects &&
                              teacher.subjects.length > 0 && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  📚 المواد: {teacher.subjects.join("، ")}
                                </p>
                              )}

                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] px-2 py-1 rounded-full ${getSubscriptionTypeColor(
                                  teacher.subscriptionType,
                                )}`}
                              >
                                {getSubscriptionTypeLabel(
                                  teacher.subscriptionType,
                                )}
                              </span>

                              {/* ✅ Optional stats لو موجودة بالداتا */}
                              {typeof teacher.examsCount === "number" && (
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                  📄 {teacher.examsCount} امتحان
                                </span>
                              )}
                              {typeof teacher.questionsCount === "number" && (
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                  ✅ {teacher.questionsCount} سؤال
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ Divider */}
                      <div className="mt-4 border-t border-gray-100" />

                      {/* ✅ Actions */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => handleViewExams(teacher._id)}
                            className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold"
                          >
                            📚 عرض الامتحانات <span>→</span>
                          </button>

                          <button
                            onClick={(e) => handleShareTeacher(teacher._id, e)}
                            className="w-full px-4 py-2.5 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold"
                            title="مشاركة ملف المعلم"
                          >
                            🔗 مشاركة
                          </button>
                        </div>

                        {/* ✅ Hint صغير */}
                        <p className="text-[11px] text-gray-500 mt-3 text-center">
                          روابط المشاركة صالحة لمدة 30 يوم
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

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
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-[92%] p-6">
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
