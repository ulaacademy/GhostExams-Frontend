"use client";
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import {
  fetchActiveStudentPlans,
  createStudentSubscription,
  fetchUserId,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

const StudentSubscription = ({ embedded = false }) => {
  const { token } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [subscriptionData, setSubscriptionData] = useState({
    // ✅ بنخليهم موجودين بالستيت (مش ظاهرين بالفورم)
    startDate: "",
    endDate: "",
    paymentMethod: "cash",

    // ✅ اللي بدنا نظهره
    amount: 0,
    currency: "JOD",

    // ✅ نخليه ثابت (مش ظاهر ولا قابل للكتابة)
    notes: "مرحبا، أنا مهتم بالاشتراك بحزمة الموقع.",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [studentId, setStudentId] = useState(null);

  // ✅ إذا مش مسجل دخول → رجع للّوجين مع redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!token) {
      router.push({
        pathname: "/auth/Login",
        query: {
          redirect: `/student/subscription${
            router.query.planId ? `?planId=${router.query.planId}` : ""
          }`,
          message: "loginRequired",
        },
      });
    }
  }, [token, router]);

  const handlePlanSelect = useCallback(
    (plan) => {
      setSelectedPlan(plan);

      const currentStartDate =
        subscriptionData.startDate || new Date().toISOString().split("T")[0];

      const endDate = new Date(currentStartDate);
      endDate.setDate(endDate.getDate() + (plan.duration || 30));

      setSubscriptionData((prev) => ({
        ...prev,
        amount: plan.price,
        currency: plan.currency || "JOD",
        startDate: currentStartDate,
        endDate: endDate.toISOString().split("T")[0],
        paymentMethod: "cash",
        notes: `مرحبا، أنا مهتم بالاشتراك بحزمة الموقع: ${plan.name}`,
      }));
    },
    [subscriptionData.startDate],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const plansResponse = await fetchActiveStudentPlans();
        if (plansResponse?.success && Array.isArray(plansResponse.data)) {
          setPlans(plansResponse.data);
        } else {
          setPlans([]);
        }

        const uid = await fetchUserId();
        if (uid) setStudentId(uid);
      } catch (err) {
        console.error("❌ خطأ في تحميل بيانات خطط الطلاب:", err);
        setMessage("❌ حدث خطأ في تحميل البيانات");
      }
    };

    loadData();
  }, []);

  // ✅ إذا إجا planId من URL اختاره تلقائياً
  useEffect(() => {
    if (plans.length > 0 && router.query.planId && !selectedPlan) {
      const plan = plans.find((p) => p._id === router.query.planId);
      if (plan) handlePlanSelect(plan);
    }
  }, [router.query.planId, plans, selectedPlan, handlePlanSelect]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlan) {
      setMessage("❌ اختر خطة من الأعلى أولاً ثم اضغط إرسال");
      return;
    }

    if (!studentId) {
      setMessage("❌ لم يتم العثور على معرف الطالب، جرّب تسجيل خروج ودخول");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        studentId,
        planId: selectedPlan._id,

        // ✅ بنرسلهم زي قبل (حتى لو مش ظاهرين)
        customStartDate: subscriptionData?.startDate || undefined,
        customEndDate: subscriptionData?.endDate || undefined,
        paymentMethod: subscriptionData?.paymentMethod || "cash",

        amount: Number(subscriptionData?.amount || 0),
        currency: subscriptionData?.currency || "JOD",

        // ✅ ملاحظات ثابتة (للتفريق إنه Lead)
        notes:
          subscriptionData?.notes || "مرحبا، أنا مهتم بالاشتراك بحزمة الموقع.",

        source: "student-portal",
      };

      const res = await createStudentSubscription(payload);

      if (res?.success) {
        const successMsg =
          res?.message ||
          "✅ تم إرسال طلب اشتراكك بنجاح. الرجاء الانتظار لتفعيل الاشتراك خلال 24 ساعة.";

        setMessage(successMsg);

        const planName = encodeURIComponent(selectedPlan?.name || "الخطة");
        router.push(
          `/dashboard/studentDashboard?status=pending&plan=${planName}`,
        );

        // تنظيف
        setSelectedPlan(null);
        setSubscriptionData((prev) => ({
          ...prev,
          startDate: "",
          endDate: "",
          paymentMethod: "cash",
          amount: 0,
          currency: "JOD",
          notes: "مرحبا، أنا مهتم بالاشتراك بحزمة الموقع.",
        }));
      } else {
        setMessage(res?.message || "❌ فشل إرسال طلب الاشتراك");
      }
    } catch (error) {
      console.error("❌ خطأ في اشتراك الطالب:", error);
      const apiMsg =
        error?.response?.data?.message || "❌ حدث خطأ أثناء الإرسال";
      setMessage(apiMsg);

      if (error?.response?.status === 409) {
        const planName = encodeURIComponent(selectedPlan?.name || "الخطة");
        router.push(
          `/dashboard/studentDashboard?status=pending&plan=${planName}`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-900 text-white"}>
      {!embedded && <Navbar />}

      <div dir="rtl" className={embedded ? "p-0" : "p-6 text-right pt-24"}>
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
            اختر خطة الطالب المناسبة 🎯 او تواصل على 0791515106 للمساعدة
          </h1>

          {/* ✅ عرض خطط الطلاب */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              اختر الخطة من الأسفل (ثم أكمل الطلب من فورم الاشتراك)
            </h2>

            {plans.length === 0 ? (
              <div className="text-center text-gray-300">
                لا توجد خطط طلاب متاحة حالياً
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan, index) => {
                  const isSelected = selectedPlan?._id === plan._id;

                  const namePriceColorClasses = [
                    "text-yellow-400",
                    "text-blue-400",
                    "text-green-400",
                  ];
                  const borderColorClasses = [
                    "border-yellow-500",
                    "border-blue-500",
                    "border-green-500",
                  ];

                  const namePriceColor = namePriceColorClasses[index % 3];
                  const borderColor = borderColorClasses[index % 3];

                  return (
                    <div
                      key={plan._id}
                      className={`bg-gray-800 p-6 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? `border-2 ${borderColor} transform scale-105`
                          : "border-2 border-transparent hover:border-gray-600"
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <h3
                        className={`text-2xl font-bold mb-2 text-center ${namePriceColor}`}
                      >
                        {plan.name}
                      </h3>

                      {plan.description && (
                        <p className="text-gray-300 text-sm mb-4 text-center">
                          {plan.description}
                        </p>
                      )}

                      <ul
                        dir="rtl"
                        className="space-y-2 text-sm mb-4 text-right pr-5 list-disc"
                      >
                        <li>اشتراك لطالب 1</li>

                        {plan.maxTeachers != null && (
                          <li>
                            يمكن إضافة <span dir="ltr">{plan.maxTeachers}</span>{" "}
                            معلمين
                          </li>
                        )}

                        {plan.teacherType != null && (
                          <li>
                            نوع المعلم:{" "}
                            {plan.teacherType === "platform"
                              ? "معلم أساسي"
                              : plan.teacherType === "ghost"
                                ? "معلم Ai"
                                : "معلم أساسي / معلم Ai "}
                          </li>
                        )}

                        {plan.duration != null && (
                          <li>
                            مدة <span dir="ltr">{plan.duration}</span>{" "}
                            {plan.durationUnit === "days"
                              ? "يوم"
                              : plan.durationUnit === "months"
                                ? "شهر"
                                : plan.durationUnit === "years"
                                  ? "سنة"
                                  : plan.durationUnit || "days"}
                          </li>
                        )}

                        <li>عدد امتحانات مفتوح</li>
                        <li>عدد مرات الإعادة مفتوحة</li>
                        <li>عدد الأسئلة مفتوح</li>
                      </ul>

                      <p
                        className={`text-3xl font-bold mb-2 text-center ${namePriceColor}`}
                      >
                        {plan.price} {plan.currency || "JOD"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ✅ نموذج الإرسال (ظاهر دائمًا) */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              تفاصيل الاشتراك{" "}
              {selectedPlan ? (
                <>
                  -{" "}
                  <span className="text-yellow-400 font-extrabold">
                    {selectedPlan.name}
                  </span>
                </>
              ) : (
                <span className="text-gray-300 text-base font-normal">
                  (اختر خطة من الأعلى أولاً)
                </span>
              )}
            </h2>

            {/* ✅ تنبيه واضح */}
            {!selectedPlan && (
              <div className="mb-4 p-4 rounded-xl bg-gray-900/60 border border-yellow-500/20 text-yellow-200 text-sm">
                ✅ اختار أي خطة من الأعلى أولاً، بعدها بصير زر “إرسال طلب
                الاشتراك” شغال.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">المبلغ</label>
                  <input
                    type="number"
                    name="amount"
                    value={subscriptionData.amount}
                    readOnly
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">العملة</label>
                  <input
                    type="text"
                    name="currency"
                    value={subscriptionData.currency}
                    readOnly
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* ✅ ملاحظات ثابتة (مش ظاهرة) */}
              <input
                type="hidden"
                name="notes"
                value={subscriptionData.notes}
              />

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes("✅")
                      ? "bg-green-900 text-green-100"
                      : "bg-red-900 text-red-100"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || !selectedPlan}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "جاري المعالجة..." : "إرسال طلب الاشتراك"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    setMessage("");
                    setSubscriptionData((prev) => ({
                      ...prev,
                      startDate: "",
                      endDate: "",
                      paymentMethod: "cash",
                      amount: 0,
                      currency: "JOD",
                      notes: "مرحبا، أنا مهتم بالاشتراك بحزمة الموقع.",
                    }));
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubscription;
