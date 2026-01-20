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
    startDate: "",
    endDate: "",
    paymentMethod: "cash",
    amount: 0,
    currency: "JOD",
    notes: "",
  });

  //const [setLoading] = useState(true);
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
      // ✅ إذا duration = أيام
      endDate.setDate(endDate.getDate() + (plan.duration || 30));

      setSubscriptionData((prev) => ({
        ...prev,
        amount: plan.price,
        currency: plan.currency || "JOD",
        startDate: currentStartDate,
        endDate: endDate.toISOString().split("T")[0],
      }));
    },
    [subscriptionData.startDate]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // ✅ جلب خطط الطلاب
        const plansResponse = await fetchActiveStudentPlans();
        if (plansResponse?.success && Array.isArray(plansResponse.data)) {
          setPlans(plansResponse.data);
          console.log("PLANS_FROM_API:", plansResponse.data);
          console.log("PLAN_0_FIELDS:", plansResponse.data?.[0]);
        } else {
          setPlans([]);
        }

        // ✅ جلب studentId
        const uid = await fetchUserId();
        if (uid) setStudentId(uid);
      } catch (err) {
        console.error("❌ خطأ في تحميل بيانات خطط الطلاب:", err);
        setMessage("❌ حدث خطأ في تحميل البيانات");
      } finally {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlan) {
      setMessage("❌ يرجى اختيار خطة أولاً");
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

        // ✅ إذا عندك هذه الحقول بالصفحة وخليتها بالموديل/الكنترولر
        customStartDate: subscriptionData?.startDate || undefined,
        customEndDate: subscriptionData?.endDate || undefined,
        paymentMethod: subscriptionData?.paymentMethod || "cash",
        amount: Number(subscriptionData?.amount || 0),
        currency: subscriptionData?.currency || "JOD",
        notes: subscriptionData?.notes || "",
        source: "student-portal",
      };

      const res = await createStudentSubscription(payload);

      if (res?.success) {
        // ✅ خذ رسالة الباك مباشرة
        const successMsg =
          res?.message ||
          "✅ تم إرسال طلب اشتراكك بنجاح. الرجاء الانتظار لتفعيل الاشتراك خلال 24 ساعة.";

        setMessage(successMsg);

        // ✅ حوّل للداشبورد مع باراميتر pending + اسم الخطة
        const planName = encodeURIComponent(selectedPlan?.name || "الخطة");
        router.push(
          `/dashboard/studentDashboard?status=pending&plan=${planName}`
        );

        // (اختياري) تنظيف
        setSelectedPlan(null);
        setSubscriptionData({
          startDate: "",
          endDate: "",
          paymentMethod: "cash",
          amount: 0,
          currency: "JOD",
          notes: "",
        });
      } else {
        setMessage(res?.message || "❌ فشل إرسال طلب الاشتراك");
      }
    } catch (error) {
      console.error("❌ خطأ في اشتراك الطالب:", error);

      // ✅ أهم سطر: خذ رسالة الباك (409 pending أو 409 active أو 400...)
      const apiMsg =
        error?.response?.data?.message || "❌ حدث خطأ أثناء الإرسال";

      setMessage(apiMsg);

      // ✅ إذا رجع 409 بسبب Pending: خليه يروح للداشبورد ويشوف رسالة انتظار
      if (error?.response?.status === 409) {
        const planName = encodeURIComponent(selectedPlan?.name || "الخطة");
        router.push(
          `/dashboard/studentDashboard?status=pending&plan=${planName}`
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
            اختر خطة الطالب المناسبة 🎯
          </h1>

          {/* ✅ عرض خطط الطلاب */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              اضغط على الخطة المناسبة ثم أكمل الطلب
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
                              ? "معلم منصة"
                              : plan.teacherType === "ghost"
                              ? "معلم الشبح"
                              : "معلم منصة / معلم الشبح"}
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

                      {plan.features && plan.features.length > 0 && (
                        <ul className="text-sm space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start justify-end gap-2"
                            >
                              <span className="text-right">{feature}</span>
                              <span className="shrink-0">✓</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ✅ نموذج الإرسال */}
          {selectedPlan ? (
            <div className="bg-gray-800 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center">
                تفاصيل الاشتراك -{" "}
                <span className="text-yellow-400 font-extrabold">
                  {selectedPlan.name}
                </span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      تاريخ بداية الاشتراك
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={subscriptionData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      تاريخ نهاية الاشتراك
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={subscriptionData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    طريقة الدفع
                  </label>
                  <select
                    name="paymentMethod"
                    value={subscriptionData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="cash">
                      تحويل مبلغ الاشتراك كليك إلى GHOSTEXAMS - بنك الاتحاد
                    </option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      المبلغ
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={subscriptionData.amount}
                      readOnly
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      العملة
                    </label>
                    <input
                      type="text"
                      name="currency"
                      value={subscriptionData.currency}
                      readOnly
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    ملاحظات (اكتب رقم تلفونك للتواصل)
                  </label>
                  <textarea
                    name="notes"
                    value={subscriptionData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="اكتب رقمك وملاحظاتك..."
                  />
                </div>

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
                    disabled={submitting}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? "جاري المعالجة..." : "إرسال طلب الاشتراك"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(null);
                      setMessage("");
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              اختر خطة من الأعلى لإكمال الطلب
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSubscription;
