"use client";
// 📁 المسار المناسب: frontend/src/pages/index.js

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import SmartChatBot from "../components/SmartChatBot";
import { fetchActiveStudentPlans } from "../services/api";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth() || {};
  const router = useRouter();

  const handleSubscribeClick = (planId) => {
    const targetPath = `/student/subscription${
      planId ? `?planId=${planId}` : ""
    }`;

    if (!token) {
      router.push({
        pathname: "/auth/Register",
        query: {
          redirect: targetPath,
          message: "loginRequired",
        },
      });
      return;
    }

    router.push(targetPath);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetchActiveStudentPlans();
        if (response.success && response.data) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error("❌ خطأ في جلب الخطط:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />

      {/* 🔝 Hero Section */}
      <div className="pt-24">
        <section className="flex flex-col items-center justify-center text-center py-24 px-4">
          <h1 className="text-5xl font-extrabold text-yellow-400 mb-6">
            💯 طلاب توجيهي 2009 - جهز حالك للعلامة الكاملة! 💯
          </h1>
          <div
            dir="rtl"
            className="text-gray-300 max-w-2xl space-y-4 mb-30 text-right"
          >
            <p className="text-lg font-semibold">
              🇯🇴 أول موقع بنوك أسئلة بمعلم ذكي في الأردن 🇯🇴
              <span className="text-yellow-400"> لطلاب التوجيهي 2009 </span>
            </p>
          </div>
          <Link
            href="/auth/Register"
            className="mt-10 bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-6 rounded-lg text-lg"
          >
            سجل أشترك وأمتحن من هنا
          </Link>
        </section>
      </div>

      {/* ✅ لماذا منصة الشبح؟ */}
      <section className="bg-gray-800 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          ليش منصة الشبح أقوى موقع امتحانات وبنوك أسئلة لجيل 2009 ؟ 🔥
        </h2>

        <div
          dir="rtl"
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-right"
        >
          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            ⚡ امتحانات تفاعلية سريعة + مراجعة يومية فعّالة
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            🎁 امتحانات يوميًا لكل الطلاب بدون استثناء
          </div>
          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            🚀 أضخم بنك أسئلة وزارية مصنّفة وفق أعلى المعايير الأكاديمية
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            📝 امتحانات ذكية تحاكي نمط الوزارة الحقيقي بدقة
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            🤖 ذكاء اصطناعي يحلل مستواك ويحدد نقاط القوة والضعف
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            📊 اختبر لتتعلّم واختبر لتقيس قدراتك الحقيقية
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            🔁 إمكانية إعادة أي امتحان في أي وقت مع تتبع تطورك
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            📚 امتحانات مرتبة من المنهاج تناسب جميع المستويات
          </div>
        </div>
      </section>

      {/* 📊 أنواع الامتحانات */}
      <section className="py-16 px-6 bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-10">
          أنواع الامتحانات في منصة الشبح 🧠
        </h2>

        <div
          dir="rtl"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-right"
        >
          <div className="bg-blue-600 p-6 rounded-xl shadow-lg">
            📝 امتحانات محاكية لنمط الوزارة الحقيقي
          </div>

          <div className="bg-green-600 p-6 rounded-xl shadow-lg">
            ⚡ امتحانات تفاعلية سريعة للمراجعة
          </div>

          <div className="bg-purple-600 p-6 rounded-xl shadow-lg">
            📚 امتحانات لأهم المواد الوزارية
          </div>

          <div className="bg-yellow-600 p-6 rounded-xl shadow-lg text-black">
            👨‍🏫 امتحانات من نخبة معلمي المملكة
          </div>

          <div className="bg-pink-600 p-6 rounded-xl shadow-lg">
            🔢 امتحانات من 20 إلى 100 سؤال
          </div>

          <div className="bg-red-600 p-6 rounded-xl shadow-lg">
            📊 امتحانات تقييم شاملة قبل الاختبارات
          </div>
          <div className="bg-blue-600 p-6 rounded-xl shadow-lg">
            📝 بنك اسئلة مرتب ومصنف لكل مادة
          </div>

          <div className="bg-green-600 p-6 rounded-xl shadow-lg">
            ⚡ امتحانات وتقيمات بالذكاء الاصطناعي
          </div>

          <div className="bg-yellow-600 p-6 rounded-xl shadow-lg text-black">
            👨‍🏫 اول معلم ذكاء اصطناعي للتوجيهي
          </div>
        </div>
      </section>

      {/* 🎁 عرض مجاني */}
      <section className="bg-gray-800 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">🎁 اعمل حساب مجانا🎁 </h2>
        <p className="mb-6 text-gray-300">
          جرب امتحانات الشبح مـــجـــانـــا الآن
        </p>
        <Link
          href="/auth/Register"
          className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg text-lg"
        >
          التجربة مجانية للطلاب
        </Link>
      </section>

      {/* 🛍️ خطط الاشتراك */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          خطط الاشتراك لطلاب 🎯 2009
        </h2>

        <h2 className="text-3xl font-bold text-center mb-10">
          اعمل حساب مجاني او سجل دخول للاشتراك
        </h2>

        {loading ? (
          <div className="text-center text-xl">جاري التحميل...</div>
        ) : plans.length === 0 ? (
          <div className="text-center text-xl">لا توجد خطط متاحة حالياً</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const colorClasses = [
                "text-yellow-400",
                "text-blue-400",
                "text-green-400",
              ];
              const borderClasses = [
                "border-yellow-500",
                "border-blue-500",
                "border-green-500",
              ];

              return (
                <div
                  dir="rtl"
                  key={plan._id}
                  className={`bg-gray-800 p-6 rounded-2xl text-center shadow ${
                    index === 1 ? `border-2 ${borderClasses[1]}` : ""
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      colorClasses[index] || "text-gray-400"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  {plan.description && (
                    <p className="text-sm text-gray-300 mb-2">
                      {plan.description}
                    </p>
                  )}

                  {/* ✅ تفاصيل الخطة (حقول الطالب الصحيحة) */}
                  <div className="space-y-2 text-sm text-right mt-3">
                    <p>اشتراك لطالب 1</p>

                    {plan.maxTeachers != null && (
                      <p>يمكن إضافة {plan.maxTeachers} معلمين</p>
                    )}

                    {plan.teacherType != null && (
                      <p>
                        نوع المعلم:{" "}
                        {plan.teacherType === "platform"
                          ? "معلم أساسي"
                          : plan.teacherType === "ghost"
                            ? "معلم Ai"
                            : "معلم أساسي أو  معلم Ai"}
                      </p>
                    )}

                    <p>عدد امتحانات مفتوح</p>
                    <p>عدد مرات الإعادة مفتوحة</p>
                    <p>عدد الأسئلة مفتوح</p>
                  </div>

                  <p
                    className={`text-3xl my-4 ${
                      colorClasses[index] || "text-gray-400"
                    }`}
                  >
                    {plan.price} {plan.currency}
                  </p>

                  <p className="text-xs text-gray-400 mb-4">
                    مدة {plan.duration}{" "}
                    {plan.durationUnit === "days"
                      ? "يوم"
                      : plan.durationUnit === "months"
                        ? "شهر"
                        : plan.durationUnit === "years"
                          ? "سنة"
                          : plan.durationUnit}
                  </p>

                  {/* زر الاشتراك */}
                  <button
                    type="button"
                    onClick={() => handleSubscribeClick(plan._id)}
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    اشتراك الآن 💳
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ☎️ تواصل سريع */}
      <section className="bg-gray-900 text-center py-12">
        <p className="text-lg mb-4">هل عندك استفسار؟ تواصل معنا فورًا!</p>

        <a
          href="https://wa.link/edubank"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg inline-block rounded-lg"
        >
          تواصل معنا للحصول على بنك اسئلة الكتروني
        </a>
      </section>

      {/* ✅ الشات بوت العائم */}
      <SmartChatBot />
    </div>
  );
};

export default Home;
