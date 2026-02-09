"use client";

// 📁 المسار: frontend/src/pages/tawjihi-2009/index.js

import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Tawjihi2009Index() {
  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/tawjihi-2009`;

  // ✅ OG Image (حط صورة هنا)
  // ضع الصورة في: frontend/public/og/tawjihi-2009.jpg
  const ogImage = `${siteUrl}/og/tawjihi-2009.jpg`;

  const seoTitle =
    "توجيهي 2009 | مواد وفصول الامتحانات (عربي/إنجليزي/دين/تاريخ الأردن) - GhostExams";
  const seoDescription =
    "اختر المادة ثم الفصل (الأول أو الثاني) للوصول مباشرة لامتحانات توجيهي 2009: عربي، إنجليزي، دين، وتاريخ الأردن.";

  const subjects = [
    {
      title: "بنك اسئلة وامتحانات تاريخ الأردن توجيهي 2009",
      emoji: "🇯🇴",
      subjectSlug: "/tawjihi-2009/jordan-history",
      term1: "/tawjihi-2009/jordan-history/term-1",
      term2: "/tawjihi-2009/jordan-history/term-2",
    },

    {
      title: "بنك اسئلة وامتحانات إنجليزي توجيهي 2009",
      emoji: "🇬🇧",
      subjectSlug: "/tawjihi-2009/english",
      term1: "/tawjihi-2009/english/term-1",
      term2: "/tawjihi-2009/english/term-2",
    },

    {
      title: "بنك اسئلة وامتحانات عربي توجيهي 2009",
      emoji: "📚",
      subjectSlug: "/tawjihi-2009/arabic",
      term1: "/tawjihi-2009/arabic/term-1",
      term2: "/tawjihi-2009/arabic/term-2",
    },

    {
      title: "بنك اسئلة وامتحانات دين توجيهي 2009",
      emoji: "🕌",
      subjectSlug: "/tawjihi-2009/islamic",
      term1: "/tawjihi-2009/islamic/term-1",
      term2: "/tawjihi-2009/islamic/term-2",
    },
  ];

  // ✅ JSON-LD
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

  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "GhostExams",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "توجيهي 2009",
        item: canonicalUrl,
      },
    ],
  };

  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "مواد توجيهي 2009 على GhostExams",
    itemListElement: subjects.map((s, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: s.title,
      url: `${siteUrl}${s.subjectSlug}`,
    })),
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

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
          content="GhostExams | بوابة توجيهي 2009"
        />

        {/* ✅ Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* ✅ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdBreadcrumbs),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
        />
      </Head>

      <Navbar />

      <main dir="rtl" className="pt-24 pb-14 px-4 max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-400">
          بوابة توجيهي 2009
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
          اختر المادة ثم اختر الفصل للوصول مباشرة للامتحانات.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((s) => (
            <div
              key={s.subjectSlug}
              className="bg-gray-800/70 border border-yellow-500/15 rounded-2xl p-5 shadow-lg"
            >
              <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300">
                {s.emoji} {s.title}
              </h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={s.term1}
                  className="inline-flex justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2.5"
                >
                  الفصل الأول
                </Link>

                <Link
                  href={s.term2}
                  className="inline-flex justify-center rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5"
                >
                  الفصل الثاني
                </Link>
              </div>

              <div className="mt-3 text-xs text-gray-300/80">
                <Link href={s.subjectSlug} className="hover:text-yellow-300">
                  صفحة المادة →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400">
          ملاحظة: تحتاج للاشتراك بأحد عروضنا عند بدء حل الامتحانات.
        </p>
      </main>
    </div>
  );
}
