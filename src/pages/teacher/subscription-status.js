"use client";
import React, { useState, useEffect } from "react";
import TeacherLayout from "../../components/TeacherLayout";
import {
  fetchActiveSubscription,
  fetchTeacherSubscriptions,
  fetchUserId,
} from "../../services/api";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

const TeacherSubscriptionStatus = () => {
  const { user } = useAuth();
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const userId = await fetchUserId();
        if (!userId) {
          setError("❌ يرجى تسجيل الدخول أولاً");
          setLoading(false);
          return;
        }

        // جلب الاشتراك النشط
        const activeResponse = await fetchActiveSubscription(userId);
        if (activeResponse?.success && activeResponse?.data) {
          setActiveSubscription(activeResponse.data);
        }

        // جلب جميع الاشتراكات
        const allResponse = await fetchTeacherSubscriptions(userId);
        if (allResponse?.success && allResponse?.data) {
          setAllSubscriptions(allResponse.data);
        }
      } catch (err) {
        console.error("❌ خطأ في تحميل الاشتراكات:", err);
        setError("❌ حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-green-500 text-white",
      inactive: "bg-gray-500 text-white",
      pending: "bg-yellow-500 text-black",
      expired: "bg-red-500 text-white",
      cancelled: "bg-gray-700 text-white",
    };
    const labels = {
      active: "نشط",
      inactive: "غير نشط",
      pending: "في الانتظار",
      expired: "منتهي",
      cancelled: "ملغي",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-bold ${
          badges[status] || badges.inactive
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      paid: "bg-green-500 text-white",
      pending: "bg-yellow-500 text-black",
      failed: "bg-red-500 text-white",
      refunded: "bg-gray-700 text-white",
    };
    const labels = {
      paid: "مدفوع",
      pending: "في الانتظار",
      failed: "فاشل",
      refunded: "مسترجع",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-bold ${
          badges[status] || badges.pending
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <TeacherLayout teacherName={user?.name || "Teacher"}>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400">حالة الاشتراك</h1>
          <Link
            href="/teacher/subscription"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors"
          >
            إنشاء اشتراك جديد
          </Link>
        </div>

        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* الاشتراك النشط */}
        {activeSubscription ? (
          <div className="bg-gray-800 p-6 rounded-2xl mb-8 border-2 border-green-500">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-green-400">
                الاشتراك النشط
              </h2>
              {getStatusBadge(activeSubscription.status)}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">معلومات الخطة</h3>
                <p className="mb-1">
                  <span className="text-gray-400">الاسم:</span>{" "}
                  {activeSubscription.planId?.name}
                </p>
                <p className="mb-1">
                  <span className="text-gray-400">الحد الأقصى للطلاب:</span>{" "}
                  {activeSubscription.planId?.maxStudents}
                </p>
                <p className="mb-1">
                  <span className="text-gray-400">الحد الأقصى للامتحانات:</span>{" "}
                  {activeSubscription.planId?.maxExams}
                </p>
                <p className="mb-1">
                  <span className="text-gray-400">الحد الأقصى للأسئلة:</span>{" "}
                  {activeSubscription.planId?.maxQuestions}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">تفاصيل الاشتراك</h3>
                <p className="mb-1">
                  <span className="text-gray-400">تاريخ البداية:</span>{" "}
                  {new Date(activeSubscription.startDate).toLocaleDateString(
                    "ar-EG"
                  )}
                </p>
                <p className="mb-1">
                  <span className="text-gray-400">تاريخ النهاية:</span>{" "}
                  {new Date(activeSubscription.endDate).toLocaleDateString(
                    "ar-EG"
                  )}
                </p>
                <p className="mb-1">
                  <span className="text-gray-400">المبلغ:</span>{" "}
                  {activeSubscription.amount} {activeSubscription.currency}
                </p>
                <p className="mb-1">
                  <span className="text-gray-400">حالة الدفع:</span>{" "}
                  {getPaymentStatusBadge(activeSubscription.paymentStatus)}
                </p>
                {activeSubscription.notes && (
                  <p className="mb-1">
                    <span className="text-gray-400">ملاحظات:</span>{" "}
                    {activeSubscription.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-900 text-yellow-100 p-6 rounded-lg mb-8">
            ⚠️ لا يوجد اشتراك نشط حالياً
          </div>
        )}

        {/* جميع الاشتراكات */}
        <div>
          <h2 className="text-2xl font-bold mb-4">جميع الاشتراكات</h2>

          {allSubscriptions.length === 0 ? (
            <div className="bg-gray-800 p-6 rounded-2xl text-center text-gray-400">
              لا توجد اشتراكات سابقة
            </div>
          ) : (
            <div className="space-y-4">
              {allSubscriptions.map((subscription) => (
                <div
                  key={subscription._id}
                  className="bg-gray-800 p-6 rounded-2xl border-2 border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {subscription.planId?.name || "خطة غير محددة"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(subscription.createdAt).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(subscription.status)}
                      {getPaymentStatusBadge(subscription.paymentStatus)}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">من</p>
                      <p>
                        {new Date(
                          subscription.startDate
                        ).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">إلى</p>
                      <p>
                        {new Date(subscription.endDate).toLocaleDateString(
                          "ar-EG"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">المبلغ</p>
                      <p className="text-yellow-400 font-bold">
                        {subscription.amount} {subscription.currency}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherSubscriptionStatus;
