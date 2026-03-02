"use client";
// 📁 المسار: frontend/src/pages/index.js

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
//import SmartChatBot from "../components/SmartChatBot";
import { fetchActiveStudentPlans } from "../services/api";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth() || {};
  const router = useRouter();

  // ✅ SEO (Home)
  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/`;

  // ✅ OG Image (ضع الصورة هنا: frontend/public/og/home.jpg)
  const ogImage = `${siteUrl}/og/home.jpg`;

  const seoTitle =
    "امتحانات توجيهي 2009 | بنك أسئلة شامل: عربي، إنجليزي، دين، تاريخ";

  const seoDescription =
    "منصة GhostExams: امتحانات إلكترونية وبنك أسئلة توجيهي 2009. امتحانات وزارية تحاكي النمط الوزاري ومدعومة بالذكاء الاصطناعي للمواد: عربي، إنجليزي، دين، تاريخ.";

  // (ملاحظة: meta keywords مش عامل قوي بجوجل، بس بنتركها كاحتياط)
  const seoKeywords =
    "امتحانات توجيهي 2009, امتحانات توجيهي الأردن, امتحانات إلكترونية توجيهي, بنك أسئلة توجيهي, بنك أسئلة عربي توجيهي, بنك أسئلة إنجليزي توجيهي, بنك أسئلة تربية إسلامية توجيهي, بنك أسئلة تاريخ الأردن توجيهي, محاكاة الوزارة, نمط الوزارة, امتحانات وزارية الأردن, GhostExams";

  // ✅ روابط المواد
  const subjects = [
    {
      name: "اللغة الإنجليزية 2009",
      slug: "/tawjihi-2009/english",
      description:
        "امتحانات وبنك أسئلة إنجليزي توجيهي 2009 (فصل أول/ فصل ثاني).",
      badge: "إنجليزي 2009",
      emoji: "🇬🇧",
    },
    {
      name: "تاريخ الأردن 2009",
      slug: "/tawjihi-2009/jordan-history",
      description:
        "امتحانات وبنك أسئلة تاريخ الأردن توجيهي 2009 (فصل أول/ فصل ثاني).",
      badge: "تاريخ 2009",
      emoji: "🇯🇴",
    },
    {
      name: "اللغة العربية 2009",
      slug: "/tawjihi-2009/arabic",
      description: "امتحانات وبنك أسئلة عربي توجيهي 2009 (فصل أول/ فصل ثاني).",
      badge: "عربي 2009",
      emoji: "📚",
    },

    {
      name: "التربية الإسلامية 2009",
      slug: "/tawjihi-2009/islamic",
      description: "امتحانات وبنك أسئلة دين توجيهي 2009 (فصل أول/ فصل ثاني).",
      badge: "دين 2009",
      emoji: "🕌",
    },
  ];

  const handleSubscribeClick = (planId) => {
    const targetPath = `/student/subscription${planId ? `?planId=${planId}` : ""}`;

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

  // ✅ JSON-LD (Structured Data)
  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GhostExams",
    url: siteUrl,
    inLanguage: "ar-JO",
    description: seoDescription,
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GhostExams",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
  };

  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seoTitle,
    url: canonicalUrl,
    description: seoDescription,
    inLanguage: "ar-JO",
    isPartOf: {
      "@type": "WebSite",
      name: "GhostExams",
      url: siteUrl,
    },
  };

  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "مواد توجيهي 2009 على GhostExams",
    itemListElement: subjects.map((s, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: s.name,
      url: `${siteUrl}${s.slug}`,
    })),
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="GhostExams" />

        {/* ✅ Canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_JO" />
        <meta property="og:site_name" content="GhostExams" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="GhostExams | امتحانات توجيهي 2009"
        />

        {/* ✅ Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* ✅ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrganization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
        />
      </Head>

      <Navbar />

      {/* ✅ Main landmark (حل مشكلة التقرير) */}
      <main id="main-content" dir="rtl">
        {/* 🔝 Hero Section */}
        <div className="pt-24">
          <section
            dir="rtl"
            className="flex flex-col items-center justify-center text-center py-24 px-4"
          >
            <h1 className="text-4xl sm:text-4xl font-extrabold text-yellow-400 mb-4 leading-snug">
              بنوك اسئلة وامتحانات توجيهي 2009 — أول معلم Ai بالأردن{" "}
            </h1>

            <div className="text-yellow-300/90 text-lg mb-6">
              <span className="mx-1">💯</span>
              <span className="mx-1">🇯🇴</span>
              <span className="mx-1">🤖</span>
              <span className="mx-1">🧠</span>
            </div>

            <p className="text-gray-300 max-w-3xl mb-6 leading-relaxed text-center">
              امتحانات إلكترونية وبنك أسئلة لتوجيهي الأردن 2009: عربي، إنجليزي،
              تربية إسلامية، وتاريخ الأردن — نماذج تحاكي النمط الوزاري مع تتبع
              مستوى الطالب ونقاط القوة والضعف.
            </p>

            {/* ✅ بلوكات المواد */}
            <div dir="rtl" className="w-full max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjects.map((s) => (
                  <Link
                    key={s.slug}
                    href={s.slug}
                    className="group bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/15 hover:border-yellow-500/40 rounded-2xl p-5 text-right transition shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">
                        {s.badge}
                      </span>
                      <span className="text-yellow-400 group-hover:translate-x-1 transition">
                        ←
                      </span>
                    </div>

                    <h2 className="text-lg font-extrabold text-yellow-300 leading-tight line-clamp-1">
                      <span className="ml-2">{s.emoji}</span>
                      {s.name}
                    </h2>

                    <p className="mt-2 text-xs text-gray-300/90 leading-relaxed min-h-[38px]">
                      {s.description}
                    </p>

                    <div className="mt-4 text-sm font-bold text-black bg-yellow-500 group-hover:bg-yellow-600 inline-flex items-center justify-center rounded-xl px-4 py-2 w-full">
                      عرض الامتحانات
                    </div>
                  </Link>
                ))}
              </div>

              <p className="mt-5 text-xs text-gray-300/80">
                ملاحظة: يمكنك تصفح المواد والامتحانات، وعند بدء الحل قد تحتاج
                إنشاء حساب.
              </p>
            </div>
          </section>
        </div>

        {/* 🎁 عرض مجاني */}
        <section className="bg-gray-800 py-16 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">اعمل حساب مجانا</h2>
          <p className="mb-6 text-gray-300">جرب امتحانات الشبح مجانا الآن</p>
          <Link
            href="/auth/Register"
            className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg text-lg"
          >
            التجربة مجانية للطلاب
          </Link>
        </section>

        {/* ✅ لماذا منصة الشبح؟ */}
        <section className="bg-gray-800 py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-10">
            ماذا يتضمن الاشتراك لطلاب توجيهي 2009؟
          </h2>

          <div
            dir="rtl"
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-right"
          >
            <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
              ⚡ امتحانات تفاعلية سريعة + مراجعة يومية فعّالة
            </div>

            <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
              🎁 اكثر من 8000+ سؤال - 120+ امتحان - اربع مواد وزارية
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
            أنواع الامتحانات في منصة الشبح
          </h2>

          <div
            dir="rtl"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-right"
          >
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg font-semibold">
              📝 امتحانات محاكية لنمط الوزارة الحقيقي
            </div>

            <div className="bg-green-700 text-white p-6 rounded-xl shadow-lg font-semibold">
              ⚡ امتحانات تفاعلية سريعة للمراجعة
            </div>

            <div className="bg-purple-700 text-white p-6 rounded-xl shadow-lg font-semibold">
              📚 امتحانات لأهم المواد الوزارية
            </div>

            <div className="bg-yellow-500 text-slate-900 p-6 rounded-xl shadow-lg font-semibold">
              👨‍🏫 امتحانات بأفكار جديدة وذكية
            </div>

            <div className="bg-pink-700 text-white p-6 rounded-xl shadow-lg font-semibold">
              🔢 امتحانات من 20 إلى 100 سؤال
            </div>

            <div className="bg-red-700 text-white p-6 rounded-xl shadow-lg font-semibold">
              📊 امتحانات تقييم شاملة قبل الاختبارات
            </div>

            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg font-semibold">
              📝 بنك اسئلة مرتب ومصنف لكل مادة
            </div>

            <div className="bg-green-700 text-white p-6 rounded-xl shadow-lg font-semibold">
              ⚡ امتحانات وتقيمات بعد كل امتحان
            </div>

            <div className="bg-yellow-500 text-slate-900 p-6 rounded-xl shadow-lg font-semibold">
              👨‍🏫 اول معلم (Ai) للتوجيهي
            </div>
          </div>
        </section>

        {/* 🛍️ خطط الاشتراك */}
        <section className="py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-10">
            خطط الاشتراك لطلاب 2009
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
                              : "معلم أساسي أو معلم Ai"}
                        </p>
                      )}

                      <p>عدد امتحانات مفتوح</p>
                      <p>عدد مرات الإعادة مفتوحة</p>
                      <p>عدد الأسئلة مفتوح</p>
                    </div>

                    <p
                      className={`text-3xl my-4 ${colorClasses[index] || "text-gray-400"}`}
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
            href="https://wa.link/ghostexams"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg inline-block rounded-lg"
          >
            تواصل معنا للحصول على بنك اسئلة الكتروني
          </a>
        </section>
      </main>

      {/* ✅ الشات بوت العائم */}
      {/* <SmartChatBot /> */}
    </div>
  );
};

export default Home;
