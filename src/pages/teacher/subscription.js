"use client";
import React, { useState, useEffect, useCallback } from "react";
import TeacherLayout from "../../components/TeacherLayout";
import {
  fetchActivePlans,
  createTeacherSubscription,
  fetchUserId,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

const TeacherSubscription = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "bank_transfer",
    amount: 0,
    currency: "JOD",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [teacherId, setTeacherId] = useState(null);

  const handlePlanSelect = useCallback(
    (plan) => {
      setSelectedPlan(plan);
      setSubscriptionData((prev) => ({
        ...prev,
        amount: plan.price,
        currency: plan.currency,
      }));

      // حساب تاريخ النهاية بناءً على مدة الخطة
      const currentStartDate =
        subscriptionData.startDate || new Date().toISOString().split("T")[0];
      const endDate = new Date(currentStartDate);
      endDate.setDate(endDate.getDate() + plan.duration);
      setSubscriptionData((prev) => ({
        ...prev,
        startDate: currentStartDate,
        endDate: endDate.toISOString().split("T")[0],
      }));
    },
    [subscriptionData.startDate]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // جلب الخطط المتاحة
        const plansResponse = await fetchActivePlans();
        if (plansResponse.success && plansResponse.data) {
          setPlans(plansResponse.data);
        }

        // جلب معرف المعلم
        const userId = await fetchUserId();
        if (userId) {
          setTeacherId(userId);
        }
      } catch (error) {
        console.error("❌ خطأ في تحميل البيانات:", error);
        setMessage("❌ حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // useEffect منفصل للتعامل مع planId من URL
  useEffect(() => {
    if (plans.length > 0 && router.query.planId && !selectedPlan) {
      const plan = plans.find((p) => p._id === router.query.planId);
      if (plan) {
        handlePlanSelect(plan);
      }
    }
  }, [router.query.planId, plans, selectedPlan, handlePlanSelect]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlan || !teacherId) {
      setMessage("❌ يرجى اختيار خطة والمعلم المحدد");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const subscriptionPayload = {
        teacherId,
        planId: selectedPlan._id,
        customStartDate: subscriptionData.startDate,
        customEndDate: subscriptionData.endDate,
        paymentMethod: subscriptionData.paymentMethod,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency,
        notes: subscriptionData.notes,
        source: "teacher-portal",
      };

      const response = await createTeacherSubscription(subscriptionPayload);

      if (response.success) {
        setMessage(
          "✅ تم إرسال طلب الاشتراك وسيقوم الفريق بتفعيله بعد المراجعة."
        );
        // إعادة تعيين النموذج
        setSelectedPlan(null);
        setSubscriptionData({
          startDate: "",
          endDate: "",
          paymentMethod: "bank_transfer",
          amount: 0,
          currency: "JOR",
          notes: "",
        });
      } else {
        setMessage("❌ فشل في إنشاء الاشتراك");
      }
    } catch (error) {
      console.error("❌ خطأ في إنشاء الاشتراك:", error);
      setMessage(
        error.response?.data?.message || "❌ حدث خطأ أثناء إنشاء الاشتراك"
      );
    } finally {
      setSubmitting(false);
    }
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
      <div
        dir="rtl"
        className="min-h-screen bg-gray-900 text-white p-6 text-right"
      >
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
            نقطة البداية لكل معلم على موقعنا - اختر الخطة المناسبة{" "}
          </h1>

          {/* عرض الخطط المتاحة */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              اضغط على الخطة المناسبة ثم الرز ارسل{" "}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const isSelected = selectedPlan?._id === plan._id;

                // ✅ ألوان حسب الخطة (اسم + سعر)
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
                    {/* ✅ اسم الخطة بالوسط وبنفس اللون */}
                    <h3
                      className={`text-2xl font-bold mb-2 text-center ${namePriceColor}`}
                    >
                      {plan.name}
                    </h3>

                    <p className="text-gray-300 text-sm mb-4 text-center">
                      {plan.description}
                    </p>

                    {/* ✅ تفاصيل "حتى" تكون على اليمين (• على اليمين) */}
                    <div className="space-y-2 text-sm mb-4">
                      <p className="flex items-start justify-end gap-2">
                        <span className="text-right">
                          حتى {plan.maxStudents} طالب
                        </span>
                        <span className="shrink-0">•</span>
                      </p>
                      <p className="flex items-start justify-end gap-2">
                        <span className="text-right">
                          حتى {plan.maxExams} امتحان
                        </span>
                        <span className="shrink-0">•</span>
                      </p>
                      <p className="flex items-start justify-end gap-2">
                        <span className="text-right">
                          حتى {plan.maxQuestions} سؤال
                        </span>
                        <span className="shrink-0">•</span>
                      </p>
                      <p className="flex items-start justify-end gap-2">
                        <span className="text-right">
                          مدة {plan.duration} {plan.durationUnit}
                        </span>
                        <span className="shrink-0">•</span>
                      </p>
                    </div>

                    {/* ✅ السعر بالوسط وبنفس لون اسم الخطة */}
                    <p
                      className={`text-3xl font-bold mb-2 text-center ${namePriceColor}`}
                    >
                      {plan.price} {plan.currency}
                    </p>

                    {/* ✅ المزايا ✓ على اليمين (قبل النص) والنص يمين */}
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
          </div>

          {/* نموذج الاشتراك */}
          {selectedPlan && (
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
                      تحويل كليك الى SOCIALANJI - بنك الاتحاد بأسم - سعيد شاهين{" "}
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
                      onChange={handleInputChange}
                      required
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
                      onChange={handleInputChange}
                      required
                      readOnly
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    name="notes"
                    value={subscriptionData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="أضف ملاحظاتك هنا واهم شيء رقم تلفونك للتواصل وتفعيل الحساب ..."
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
                    {submitting ? "جاري المعالجة..." : "ارسال الاشتراك"}
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
          )}

          {!selectedPlan && (
            <div className="text-center py-8 text-gray-400">
              يرجى اختيار خطة من الأعلى ثم اكمال عملية الاشتراك
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherSubscription;
