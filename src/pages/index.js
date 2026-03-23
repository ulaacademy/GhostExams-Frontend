"use client";
// 📁 المسار: frontend/src/pages/index.js

import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
// import SmartChatBot from "../components/SmartChatBot";
import { fetchActiveStudentPlans } from "../services/api";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth() || {};
  const router = useRouter();

  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/`;
  const ogImage = `${siteUrl}/og/home.jpg`;

  const seoTitle =
    "امتحانات توجيهي 2009 | بنك أسئلة شامل: عربي، إنجليزي، دين، تاريخ";

  const seoDescription =
    "منصة GhostExams لطلاب توجيهي 2009 في الأردن: امتحانات إلكترونية، بنك أسئلة ذكي، تحليل مستوى الطالب، محاكاة للنمط الوزاري، وتجربة دراسة سهلة وسريعة للمواد: عربي، إنجليزي، دين، وتاريخ الأردن.";

  const seoKeywords =
    "امتحانات توجيهي 2009, امتحانات توجيهي الأردن, امتحانات إلكترونية, بنك أسئلة توجيهي, بنك أسئلة عربي, بنك أسئلة إنجليزي, بنك أسئلة دين, بنك أسئلة تاريخ الأردن, محاكاة الوزارة, GhostExams";

  const subjects = [
    {
      name: "اللغة الإنجليزية 2009",
      slug: "/tawjihi-2009/english",
      description: "امتحانات وبنك أسئلة إنجليزي توجيهي 2009 للفصلين.",
      badge: "إنجليزي 2009",
      emoji: "🇬🇧",
      stats: "فصل أول + فصل ثاني",
      accent: "from-sky-500/20 to-blue-500/10",
    },
    {
      name: "تاريخ الأردن 2009",
      slug: "/tawjihi-2009/jordan-history",
      description: "امتحانات وبنك أسئلة تاريخ الأردن توجيهي 2009 للفصلين.",
      badge: "تاريخ 2009",
      emoji: "🇯🇴",
      stats: "فصل أول + فصل ثاني",
      accent: "from-emerald-500/20 to-green-500/10",
    },
    {
      name: "اللغة العربية 2009",
      slug: "/tawjihi-2009/arabic",
      description: "امتحانات وبنك أسئلة عربي توجيهي 2009 للفصلين.",
      badge: "عربي 2009",
      emoji: "📚",
      stats: "فصل أول + فصل ثاني",
      accent: "from-amber-500/20 to-yellow-500/10",
    },
    {
      name: "التربية الإسلامية 2009",
      slug: "/tawjihi-2009/islamic",
      description: "امتحانات وبنك أسئلة دين توجيهي 2009 للفصلين.",
      badge: "دين 2009",
      emoji: "🕌",
      stats: "فصل أول + فصل ثاني",
      accent: "from-fuchsia-500/20 to-purple-500/10",
    },
  ];

  const reviews = [
    {
      name: "محمد - طالب توجيهي 2009",
      text: "عنجد المنصة فرقت معي كثير. صرت أعرف أي مادة أركز عليها، والامتحانات خلتني أدرس بترتيب بدل العشوائية.",
    },
    {
      name: "لين - طالبة توجيهي 2009",
      text: "أكثر شيء أحببته أن الموقع واضح جدًا، والامتحانات قريبة من النمط الوزاري، فصار عندي ثقة أكبر قبل أي اختبار.",
    },
    {
      name: "أحمد - طالب توجيهي",
      text: "بدل ما أضيع بين ملفات ومجموعات، صارت كل الأشياء المهمة جاهزة بمكان واحد: مادة، امتحان، نتيجة، وتحليل.",
    },
    {
      name: "سارة - طالبة 2009",
      text: "حتى على الموبايل التصفح مريح جدًا. سجلت بسرعة وبدأت أحل مباشرة بدون تعقيد أو تشتيت.",
    },
  ];

  const faqs = [
    {
      q: "هل أقدر أبدأ مجانًا؟",
      a: "نعم، يمكنك إنشاء حساب مجاني وتجربة الموقع وبعدها يمكنك الاشتراك بكل الامتحانات  ",
    },
    {
      q: "هل الامتحانات مناسبة لتوجيهي 2009؟",
      a: "نعم، الصفحة والمواد والخطط كلها موجهة خصيصًا لطلاب توجيهي 2009 في الأردن.",
    },
    {
      q: "هل أقدر أعيد الامتحان أكثر من مرة؟",
      a: "نعم، الخطط تعرض بشكل واضح إمكانية إعادة الامتحانات والمتابعة المستمرة لأدائك.",
    },
    {
      q: "ما أفضل عرض للطلاب؟",
      a: "أفضل عرض حاليًا هو الخطة التي سعرها 7، لأنها متوازنة جدًا بين السعر والمزايا.",
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

  const sortedPlans = useMemo(() => {
    const cloned = [...plans];
    return cloned.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }, [plans]);

  const isBestPlan = (plan) => Number(plan?.price || 0) === 7;

  const getPlanMessage = (plan) => {
    const price = Number(plan?.price || 0);

    if (price === 7) {
      return "أفضل عرض للطلاب ⭐ الأكثر توازنًا بين السعر والمزايا";
    }

    if (price < 7) {
      return "مناسب للبدء والتجربة الأولى";
    }

    return "مناسب للطالب الذي يريد تغطية أوسع ومرونة أكبر";
  };

  const getPlanCta = (plan) => {
    const price = Number(plan?.price || 0);

    if (price === 7) return "ابدأ بأفضل عرض الآن";
    if (price < 7) return "ابدأ بالخطة الأساسية";
    return "اختر الخطة المتقدمة";
  };

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
    <div className="min-h-screen bg-[#07111f] text-white">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="GhostExams" />
        <link rel="canonical" href={canonicalUrl} />

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

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />

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

      <main id="main-content" dir="rtl" className="overflow-hidden">
        {/* خلفيات ناعمة */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute top-[220px] right-[5%] h-[260px] w-[260px] rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute top-[540px] left-[10%] h-[240px] w-[240px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        {/* HERO */}
        <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* النص */}
              <div className="text-center lg:text-right animate-[fadeUp_.7s_ease-out]">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 text-yellow-300 text-xs sm:text-sm mb-5 sm:mb-6">
                  <span>🔥</span>
                  <span>منصة ذكية ومبسطة لطلاب توجيهي 2009</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.35] sm:leading-[1.25] text-white">
                  حضّر لتوجيهي 2009
                  <span className="block mt-2 text-yellow-400">
                    بامتحانات تحاكي الوزارة
                  </span>
                  <span className="block mt-2 text-white text-xl sm:text-2xl lg:text-3xl font-bold">
                    وبنك أسئلة ذكي يساعدك تدرس أسرع
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-8 mt-5 sm:mt-6 max-w-2xl mx-auto lg:mx-0">
                  عربي، إنجليزي، دين، وتاريخ الأردن. امتحانات تفاعلية، تحليل
                  مستوى الطالب، تتبع واضح للتقدم، وتجربة سهلة جدًا على الموبايل
                  والكمبيوتر.
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mt-7 sm:mt-8">
                  <Link
                    href="/auth/Register"
                    className="rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold py-3.5 px-7 sm:px-8 shadow-[0_10px_30px_rgba(250,204,21,0.22)] transition duration-300 hover:-translate-y-0.5"
                  >
                    ابدأ مجانًا الآن
                  </Link>

                  <a
                    href="#pricing"
                    className="rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] hover:border-yellow-400/30 text-white font-bold py-3.5 px-7 sm:px-8 transition duration-300"
                  >
                    شاهد أفضل عرض للطلاب
                  </a>
                </div>

                {/* شريط ثقة سريع */}
                <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    ✅ 8000+ سؤال
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    ✅ 120+ امتحان
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    ✅ 4 مواد وزارية
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    ✅ مناسب للموبايل
                  </span>
                </div>
              </div>

              {/* البطاقة البصرية */}
              <div className="relative animate-[floatCard_5s_ease-in-out_infinite]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-4 sm:p-5 shadow-2xl">
                  <div className="rounded-[24px] bg-[#0b1728] border border-white/10 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div className="text-right">
                        <div className="text-xs sm:text-sm text-gray-400">
                          تجربة الطالب
                        </div>
                        <div className="text-lg sm:text-2xl font-extrabold text-white">
                          واضحة، سريعة، ومريحة
                        </div>
                      </div>
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-yellow-400/15 flex items-center justify-center text-2xl">
                        🎯
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.06] transition">
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-300">تحليل أداء الطالب</span>
                          <span className="font-bold text-emerald-400">نشط</span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.06] transition">
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-300">
                            امتحانات تحاكي النمط الوزاري
                          </span>
                          <span className="font-bold text-yellow-400">
                            متوفر
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.06] transition">
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-300"> إعادة غير محدودة لأي امتحان</span>
                          <span className="font-bold text-sky-400">نعم</span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-300 text-slate-900 p-4 font-extrabold text-center text-sm sm:text-base shadow-lg">
                        ابدأ الآن وخلي دراستك أوضح وأسهل
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* شريط صغير للتحويل */}
        <section className="px-4 pb-8">
          <div className="max-w-6xl mx-auto rounded-[24px] border border-yellow-400/15 bg-gradient-to-l from-yellow-400/10 via-yellow-300/[0.04] to-transparent p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-right">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      ⭐ أفضل عرض للطلاب هو خطة الاربع مواد فصلين بسعر 12 دنانير                </h2>
                <p className="text-gray-300 text-sm sm:text-base mt-1">
                  خيار متوازن جدًا بين السعر والمزايا ومناسب لمعظم الطلاب.
                </p>
              </div>

              <a
                href="#pricing"
                className="shrink-0 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold py-3 px-6 transition duration-300 hover:-translate-y-0.5"
              >
                شاهد الخطة الأفضل
              </a>
            </div>
          </div>
        </section>

        {/* المواد */}
        <section id="subjects" className="py-10 sm:py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <span className="text-yellow-400 font-bold text-sm sm:text-base">
                ابدأ من المادة
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
                اختر المادة التي تريد البدء بها
              </h2>
              <p className="text-gray-300 mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-7">
                كل مادة لها صفحة مرتبة وسهلة، وفيها الامتحانات الخاصة بها بشكل
                واضح وسريع.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {subjects.map((s, i) => (
                <Link
                  key={s.slug}
                  href={s.slug}
                  className={`group rounded-[26px] border border-white/10 bg-gradient-to-b ${s.accent} from-0% to-100% bg-[#0e1a2b] p-5 shadow-xl hover:-translate-y-1 hover:border-yellow-400/30 transition duration-300 animate-[fadeUp_.7s_ease-out]`}
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 text-yellow-300 text-xs px-3 py-1">
                      {s.badge}
                    </span>
                    <span className="text-3xl">{s.emoji}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-white min-h-[56px] leading-8">
                    {s.name}
                  </h3>

                  <p className="text-gray-300 text-sm leading-7 mt-2 min-h-[56px]">
                    {s.description}
                  </p>

                  <div className="mt-4 inline-flex items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 text-cyan-300 text-xs px-3 py-1.5">
                    {s.stats}
                  </div>

                  <div className="mt-5 rounded-2xl bg-white text-slate-900 group-hover:bg-yellow-300 font-extrabold text-center py-3 transition">
                    ابدأ المادة الآن
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* كيف تبدأ */}
        <section className="py-12 sm:py-16 px-4 bg-white/[0.03] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-9 sm:mb-12">
              <span className="text-yellow-400 font-bold text-sm sm:text-base">
                سهلة جدًا
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
                3 خطوات فقط وتبدأ
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  n: "1",
                  title: "أنشئ حساب مجاني",
                  text: "سجّل بسرعة وابدأ بتصفح المواد والصفحات بسهولة.",
                  icon: "📝",
                },
                {
                  n: "2",
                  title: "اختر المادة المناسبة",
                  text: "ادخل على المادة والفصل وابدأ من المكان الذي يناسبك.",
                  icon: "📚",
                },
                {
                  n: "3",
                  title: "حل الامتحانات وتابع مستواك",
                  text: "اختبر نفسك، أعد الامتحانات، وشوف تطورك بشكل أوضح.",
                  icon: "📈",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-[26px] border border-white/10 bg-[#0e1828] p-5 sm:p-6 text-center shadow-lg hover:-translate-y-1 transition duration-300"
                >
                  <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-yellow-400/15 border border-yellow-400/15 flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-yellow-400 text-slate-900 font-extrabold flex items-center justify-center">
                    {item.n}
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold">{item.title}</h3>
                  <p className="text-gray-300 leading-7 text-sm sm:text-base mt-3">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* لماذا المنصة */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-9 sm:mb-12">
              <span className="text-yellow-400 font-bold">ليش GhostExams؟</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
                تجربة مصممة للوضوح والسرعة والتحويل
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: "🧠", text: "تحليل واضح لنقاط القوة والضعف" },
                { icon: "⚡", text: "واجهة سريعة ومناسبة للموبايل" },
                { icon: "📝", text: "امتحانات تحاكي النمط الوزاري" },
                { icon: "🔁", text: "إعادة الامتحانات ومتابعة التقدم" },
                { icon: "📚", text: "مواد مرتبة وسهلة الوصول" },
                { icon: "🎯", text: "تركيز على الدراسة الفعلية بدون تشتيت" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6 shadow-lg hover:bg-white/[0.06] transition"
                >
                  <div className="mb-3 text-3xl">{item.icon}</div>
                  <p className="text-base sm:text-lg font-bold leading-8 text-white">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* pricing */}
        <section
          id="pricing"
          className="py-12 sm:py-16 px-4 bg-gradient-to-b from-transparent to-white/[0.03]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-yellow-400 font-bold">الاشتراكات</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
                اختر الخطة المناسبة لك
              </h2>
              <p className="text-gray-300 mt-3 text-sm sm:text-base leading-7 max-w-2xl mx-auto">
                إذا كنت تبحث عن أفضل توازن بين السعر والمزايا، فخطة 7 هي الخيار
                الأفضل لمعظم الطلاب.
              </p>
            </div>

            {loading ? (
              <div className="text-center text-xl">جاري التحميل...</div>
            ) : sortedPlans.length === 0 ? (
              <div className="text-center text-xl">لا توجد خطط متاحة حالياً</div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
                {sortedPlans.map((plan,) => {
                  const best = isBestPlan(plan);

                  return (
                    <div
                      dir="rtl"
                      key={plan._id}
                      className={`relative rounded-[30px] p-5 sm:p-6 shadow-2xl border transition duration-300 hover:-translate-y-1 ${
                        best
                          ? "bg-gradient-to-b from-yellow-400/14 to-amber-300/6 border-yellow-400/70 ring-1 ring-yellow-400/30"
                          : "bg-white/[0.04] border-white/10"
                      }`}
                    >
                      {best && (
                        <div className="absolute -top-3 right-5 rounded-full bg-yellow-400 text-slate-900 px-4 py-1 text-sm font-extrabold shadow-lg">
                          الأفضل للطلاب ⭐
                        </div>
                      )}

                      <div className="mb-5">
                        <h3
                          className={`text-2xl font-extrabold ${
                            best ? "text-yellow-300" : "text-white"
                          }`}
                        >
                          {plan.name}
                        </h3>

                        {plan.description && (
                          <p className="text-sm text-gray-300 mt-2 leading-7">
                            {plan.description}
                          </p>
                        )}

                        <p
                          className={`mt-3 text-sm font-bold leading-7 ${
                            best ? "text-yellow-200" : "text-cyan-300"
                          }`}
                        >
                          {getPlanMessage(plan)}
                        </p>
                      </div>

                      <div className="mb-5">
                        <div className="flex items-end gap-2">
                          <span
                            className={`text-4xl sm:text-5xl font-extrabold ${
                              best ? "text-yellow-300" : "text-white"
                            }`}
                          >
                            {plan.price}
                          </span>
                          <span className="text-gray-300 text-lg mb-1">
                            {plan.currency}
                          </span>
                        </div>

                        <p className="text-sm text-gray-400 mt-2">
                          مدة {plan.duration}{" "}
                          {plan.durationUnit === "days"
                            ? "يوم"
                            : plan.durationUnit === "months"
                              ? "شهر"
                              : plan.durationUnit === "years"
                                ? "سنة"
                                : plan.durationUnit}
                        </p>
                      </div>

                      <div className="space-y-3 text-sm mb-6">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          ✅ اشتراك لطالب 1
                        </div>

                        {plan.maxTeachers != null && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            ✅ يمكن إضافة {plan.maxTeachers} معلمين
                          </div>
                        )}

                        {plan.teacherType != null && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            ✅ نوع المعلم:{" "}
                            {plan.teacherType === "platform"
                              ? "معلم أساسي"
                              : plan.teacherType === "ghost"
                                ? "معلم Ai"
                                : "معلم أساسي أو معلم Ai"}
                          </div>
                        )}

                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          ✅ عدد امتحانات مفتوح
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          ✅ عدد مرات الإعادة مفتوحة
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          ✅ عدد الأسئلة مفتوح
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSubscribeClick(plan._id)}
                        className={`w-full rounded-2xl font-extrabold py-3.5 px-6 transition duration-300 ${
                          best
                            ? "bg-yellow-400 hover:bg-yellow-300 text-slate-900 shadow-[0_10px_30px_rgba(250,204,21,0.20)]"
                            : "bg-white hover:bg-yellow-300 text-slate-900"
                        }`}
                      >
                        {getPlanCta(plan)}
                      </button>

                      {best && (
                        <p className="text-xs text-yellow-100/90 text-center mt-3">
                          هذا هو العرض الذي أنصح به لمعظم الطلاب
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Reviews */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-9 sm:mb-12">
              <span className="text-yellow-400 font-bold">آراء الطلاب</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
                تجارب جميلة وواضحة من طلاب المنصة
              </h2>
              <p className="text-gray-300 mt-3 text-sm sm:text-base">
                شهادات حقيقية من طلابنا - اكثر من 3000 طالب مشترك 
                              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6 shadow-xl hover:-translate-y-1 transition duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1 text-yellow-400 text-lg">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-yellow-400/15 border border-yellow-400/20 flex items-center justify-center text-sm font-extrabold text-yellow-300">
                      {review.name.charAt(0)}
                    </div>
                  </div>

                  <p className="text-sm sm:text-[15px] text-gray-200 leading-8 min-h-[150px]">
                    “{review.text}”
                  </p>

                  <div className="mt-5 pt-4 border-t border-white/10">
                    <div className="font-bold text-white">{review.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      تقييم 5/5 على التجربة
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 px-4 bg-white/[0.03] border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-9 sm:mb-12">
              <span className="text-yellow-400 font-bold">أسئلة شائعة</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
                أشياء غالبًا يريد الطالب يعرفها
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              {faqs.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-white/10 bg-[#0d1726] p-5"
                >
                  <h3 className="text-lg font-extrabold text-white leading-8">
                    {item.q}
                  </h3>
                  <p className="text-gray-300 mt-3 leading-8 text-sm sm:text-base">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA أخير */}
        <section className="py-14 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto rounded-[32px] border border-yellow-400/20 bg-gradient-to-l from-yellow-400/12 via-amber-300/[0.05] to-transparent p-6 sm:p-10 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 text-yellow-300 px-4 py-2 text-sm mb-5">
              <span>🚀</span>
              <span>ابدأ بأوضح تجربة دراسة لتوجيهي 2009</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-[1.5]">
              جاهز تبدأ دراسة أذكى
              <span className="block text-yellow-400 mt-1">
                وتسجّل بخطوات بسيطة؟
              </span>
            </h2>

            <p className="text-gray-300 mt-4 leading-8 max-w-2xl mx-auto text-sm sm:text-base">
              أنشئ حسابك الآن، تصفح المواد، وابدأ بأفضل عرض للطلاب إذا كنت تريد
              تجربة متوازنة بين السعر والمزايا.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8">
              <Link
                href="/auth/Register"
                className="rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold py-3.5 px-8 transition duration-300 hover:-translate-y-0.5"
              >
                إنشاء حساب مجاني
              </Link>

              <a
                href="#pricing"
                className="rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold py-3.5 px-8 transition"
              >
                الانتقال إلى الاشتراكات
              </a>
            </div>

            <div className="mt-5">
              <a
                href="https://wa.link/ghostexams"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-yellow-300 hover:text-yellow-200 underline underline-offset-4"
              >
                عندك استفسار؟ تواصل معنا عبر واتساب
              </a>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatCard {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>

      {/* <SmartChatBot /> */}
    </div>
  );
};

export default Home;
