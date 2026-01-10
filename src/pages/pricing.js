"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { fetchActivePlans } from "../services/api";

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, token } = useAuth();
  // ✅ دالة للتحقق من تسجيل الدخول عند الضغط على زر الاشتراك
  const handleSubscribeClick = (planId, e) => {
    e.preventDefault();

    const storedToken = localStorage.getItem("token");
    const hasToken = !!(storedToken || token);
    const hasUser = !!user;

    // إذا لم يكن المستخدم مسجل دخول، توجيهه إلى صفحة تسجيل الدخول
    if (!hasToken || !hasUser) {
      router.push({
        pathname: "/auth/Login",
        query: {
          redirect: `/teacher/subscription?planId=${planId}`,
          message: "loginRequired",
        },
      });
    } else {
      // إذا كان مسجل دخول، الانتقال مباشرة إلى صفحة الاشتراك
      router.push(`/teacher/subscription?planId=${planId}`);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetchActivePlans();
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ✅ إضافة شريط التنقل Navbar */}
      <Navbar />

      <Head>
        <title>خطط الاشتراك | منصة الشبح </title>
        <meta
          name="description"
          content="اختر الحزمة المناسبة لك بين حزمة 499 سؤال أو 999 سؤال أو كل الأسئلة. خطط مناسبة لجميع طلاب التوجيهي الأردني."
        />
        <meta
          name="keywords"
          content="خطط الاشتراك, توجيهي الأردن, اشتراك منصة الشبح, توجيهي 2007, توجيهي 2008, امتحانات ذكية, مراجعات توجيهي"
        />
      </Head>

      {/* 🎓 لماذا منصة الشبح للمعلمين؟ */}
      <section className="bg-gray-900 py-24 px-6">
        {/* العنوان الكبير */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-orange-500 text-center mt-6 mb-6">
          أول موقع للمعلمين لانشاء امتحانات تفاعلية وبنوك اسئلة للطلاب
        </h1>

        {/* العنوان الأصغر */}
        <h2 className="text-2xl md:text-4xl font-extrabold text-blue-400 text-center mb-14">
          🔥 ليش منصة الشبح هي الخيار الأقوى لكل معلم؟
        </h2>

        {/* ✅ زر CTA للمعلم بين العنوان والخيارات */}
        <div className="text-center mb-4">
          <Link
            href="/auth/Register"
            className="inline-block mt-2 bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-6 rounded-lg text-lg font-bold"
          >
            سجّل كمعلم من هنا 🚀
          </Link>
        </div>

        {/* 📩 زر التواصل لطلب كوبون الاشتراك */}
        <div className="text-center mb-10">
          <a
            href="https://wa.link/edubank"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4"
          >
            <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-bold">
              📩 تواصل معنا مباشرة لطلب الاشتراك
            </button>
          </a>
        </div>

        <div
          dir="rtl"
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto text-right"
        >
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            ⏱️ وفّر وقتك وجهدك بإنشاء وتصحيح الامتحانات إلكترونيًا خلال دقائق
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            🧠 ابنِ بنك امتحانات ذكي خاص باسمك محفوظ، مرتب، وآمن للأبد
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            🌐 حوّل اسمك إلى براند تعليمي رقمي وكن معلمًا معروفًا خارج دائرتك
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            📈 أوصل لطلاب من كل الأردن مجانًا بدون إعلانات أو مجهود إضافي
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            📊 تابع أداء طلابك بدقة عبر داشبورد وتقارير ذكية فورية
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            ⚡ أنشئ امتحانات يومية وتفاعلية ترفع التزام الطلاب وتفاعلهم
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            🔐 احمِ محتواك من السرقة والنسخ وتحكم الكامل في أسئلتك
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            🤖 خلّي محتواك يعمل عنك 24/7 والطلاب يراجعوا بأي وقت
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            💰 حوّل نفس مجهودك إلى دخل إضافي عبر اشتراكات وامتحانات مدفوعة
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-yellow-400">
            🚀 أسبق السوق التعليمي وكن من أوائل المعلمين اللي انتقلوا للتعليم
            الذكي
          </div>
        </div>
      </section>

      {/* ✅ قسم العروض */}
      <div className="flex flex-col items-center justify-center p-6 mt-10">
        <h1 className="text-4xl font-bold mb-6 text-center">
          💰 عروض الاشتراكات للمعلمين
        </h1>

        {loading ? (
          <div className="text-center text-xl">جاري التحميل...</div>
        ) : plans.length === 0 ? (
          <div className="text-center text-xl">لا توجد خطط متاحة حالياً</div>
        ) : (
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const colorClasses = [
                "text-yellow-400 bg-yellow-500 hover:bg-yellow-600",
                "text-blue-400 bg-blue-500 hover:bg-blue-600",
                "text-green-400 bg-green-500 hover:bg-green-600",
              ];
              const buttonClasses = [
                "bg-yellow-500 hover:bg-yellow-600 text-black",
                "bg-blue-500 hover:bg-blue-600 text-white",
                "bg-green-500 hover:bg-green-600 text-white",
              ];
              const borderClasses = [
                "border-yellow-500",
                "border-blue-500",
                "border-green-500",
              ];

              return (
                <div
                  key={plan._id}
                  className={`bg-gray-800 p-8 rounded-2xl shadow-lg text-center ${
                    index === 1 ? `border-2 ${borderClasses[1]}` : ""
                  }`}
                >
                  <h2
                    className={`text-3xl font-bold mb-2 ${
                      colorClasses[index]?.split(" ")[0] || "text-gray-400"
                    }`}
                  >
                    {plan.name}
                  </h2>
                  {plan.description && (
                    <p className="text-lg text-gray-300 mb-2">
                      {plan.description}
                    </p>
                  )}
                  <p className="text-lg">حتى {plan.maxStudents} طالب</p>
                  <p className="text-lg">حتى {plan.maxExams} امتحان</p>
                  <p className="text-lg">حتى {plan.maxQuestions} سؤال</p>
                  <p className="text-lg text-gray-400">
                    مدة {plan.duration}{" "}
                    {plan.durationUnit === "days" ? "يوم" : plan.durationUnit}
                  </p>
                  <p
                    className={`text-4xl font-bold my-4 ${
                      colorClasses[index]?.split(" ")[0] || "text-gray-400"
                    }`}
                  >
                    {plan.price} {plan.currency}
                  </p>

                  {/* عرض المميزات */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="my-4">
                      <p className="text-sm font-bold mb-2 text-gray-300">
                        المميزات:
                      </p>
                      <ul className="text-sm text-left">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="mb-1">
                            ✓ {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={(e) => handleSubscribeClick(plan._id, e)}
                    className={`inline-block ${
                      buttonClasses[index] || "bg-gray-500 text-white"
                    } py-3 px-6 rounded-lg mt-4 text-lg font-bold w-full text-center`}
                  >
                    اشترِك الآن 💳
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ أزرار التنقل */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          {/* 🔙 زر العودة للصفحة الرئيسية */}
          <Link href="/" className="text-center">
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-bold">
              ⬅️ العودة إلى الصفحة الرئيسية
            </button>
          </Link>

          {/* 📩 زر التواصل لطلب كوبون الاشتراك */}
          <div className="text-center mb-10">
            <a
              href="https://wa.link/edubank"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4"
            >
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-bold">
                📩 تواصل معنا مباشرة لطلب الاشتراك
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
