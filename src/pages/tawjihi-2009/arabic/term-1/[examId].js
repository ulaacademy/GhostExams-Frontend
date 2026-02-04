"use client";

import Head from "next/head";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { API_URL } from "@/services/api";

export async function getServerSideProps({ params }) {
  try {
    const { examId } = params;

    const res = await fetch(`${API_URL}/public/exams/${examId}`);
    if (!res.ok) return { notFound: true };

    const json = await res.json();
    if (!json?.success || !json?.data) return { notFound: true };

    return { props: { exam: json.data } };
  } catch (e) {
    return { notFound: true };
  }
}

export default function ArabicTerm1ExamSEO({ exam }) {
  // ✅ ثوابت الصفحة (تتغير فقط حسب المادة/الفصل)
  const siteUrl = "https://ghostexams.com";
  const subjectLabel = "اللغة العربية";
  const subjectSlug = "arabic";
  const termNumber = 1;
  const termLabel = "الفصل الأول";

  const listPagePath = `/tawjihi-2009/${subjectSlug}/term-${termNumber}`;
  const subjectHubPath = `/tawjihi-2009/${subjectSlug}`;

  // ✅ Canonical
  const canonicalUrl = `${siteUrl}${listPagePath}/${exam._id}`;

  // ✅ Title/Description ديناميكي
  const safeExamName = exam?.examName || "امتحان عربي توجيهي 2009";
  const duration = exam?.duration ?? "";
  const questionsCount = exam?.questionsCount ?? "";

  const title = `${safeExamName} | ${subjectLabel} توجيهي 2009 - ${termLabel} | GhostExams`;
  const description = `معلومات ${safeExamName} — ${subjectLabel} توجيهي الأردن 2009 (${termLabel}). المدة: ${duration} دقيقة، عدد الأسئلة: ${questionsCount}. هذه صفحة معاينة لتحسين ظهور الامتحان في البحث، وتقديم الامتحان يتم من داخل حساب الطالب بعد الاشتراك.`;

  const keywords = [
    `امتحانات ${subjectLabel} توجيهي 2009`,
    `بنك اسئلة ${subjectLabel} توجيهي 2009`,
    `امتحان ${subjectLabel} ${termLabel} 2009`,
    "امتحانات الكترونية توجيهي الأردن",
    "نمط وزاري",
    "GhostExams",
  ].join(", ");

  // ✅ OG Image (ضع صورة فعلية داخل /public/og)
  // مثال: public/og/arabic-term-1-2009.jpg
  const ogImage = `${siteUrl}/og/${subjectSlug}-term-${termNumber}-2009.jpg`;

  // ✅ Breadcrumbs JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "توجيهي 2009",
        item: `${siteUrl}/tawjihi-2009`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: subjectLabel,
        item: `${siteUrl}${subjectHubPath}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: termLabel,
        item: `${siteUrl}${listPagePath}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: safeExamName,
        item: canonicalUrl,
      },
    ],
  };

  // ✅ WebPage JSON-LD (آمن ومفيد للفهرسة)
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: safeExamName,
    url: canonicalUrl,
    inLanguage: "ar-JO",
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "GhostExams",
      url: siteUrl,
    },
    about: [
      {
        "@type": "Thing",
        name: `${subjectLabel} توجيهي 2009`,
      },
      {
        "@type": "Thing",
        name: termLabel,
      },
    ],
  };

  // ✅ (اختياري قوي للسيو) عرض عينة أسئلة بدون إجابات — إذا الداتا فيها أسئلة
  const rawQuestions = Array.isArray(exam?.questions)
    ? exam.questions
    : Array.isArray(exam?.examQuestions)
      ? exam.examQuestions
      : [];

  const sampleQuestions = rawQuestions.slice(0, 5).map((q, idx) => {
    const qText =
      q?.questionText ||
      q?.question ||
      q?.text ||
      q?.title ||
      `سؤال ${idx + 1}`;
    const opts = Array.isArray(q?.options)
      ? q.options
      : Array.isArray(q?.choices)
        ? q.choices
        : [];
    return {
      text: String(qText || "").trim(),
      options: opts.slice(0, 4).map((o) => String(o || "").trim()),
    };
  });

  // ✅ ItemList للأسئلة (حتى لو عينة) — يساعد جوجل يفهم محتوى الصفحة
  const questionsItemListJsonLd =
    sampleQuestions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `عينة أسئلة - ${safeExamName}`,
          itemListOrder: "https://schema.org/ItemListUnordered",
          numberOfItems: sampleQuestions.length,
          itemListElement: sampleQuestions.map((q, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: q.text,
          })),
        }
      : null;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content="ar-JO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="ar_JO" />
        <meta property="og:site_name" content="GhostExams" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* ✅ Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* ✅ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        />
        {questionsItemListJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(questionsItemListJsonLd),
            }}
          />
        )}
      </Head>

      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto" dir="rtl">
        {/* ✅ Top bar (Mobile friendly) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href={listPagePath}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/20 hover:border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-300 transition w-full sm:w-auto"
          >
            <span className="text-base">→</span> رجوع
          </Link>

          <div className="text-xs sm:text-sm text-gray-300 w-full sm:w-auto text-center sm:text-left">
            {subjectLabel} 2009 / {termLabel} / معلومات الامتحان
          </div>
        </div>

        {/* ✅ Card */}
        <div className="bg-gray-800/70 border border-yellow-500/15 rounded-2xl p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-400 leading-snug">
            {safeExamName}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">
            هذه صفحة معاينة مفهرسة لتوضيح بيانات الامتحان (SEO). تقديم الامتحان
            يتم من داخل حساب الطالب بعد الاشتراك.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-200">
            <div className="bg-gray-900/50 rounded-xl p-4">
              📚 المادة:{" "}
              <span className="text-yellow-300 font-bold">{subjectLabel}</span>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4">
              🧪 الصف:{" "}
              <span className="text-yellow-300 font-bold">
                {exam?.grade || "2009"}
              </span>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4">
              📅 الفصل:{" "}
              <span className="text-yellow-300 font-bold">
                {exam?.term || termNumber}
              </span>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4">
              🕒 المدة:{" "}
              <span className="text-yellow-300 font-bold">{duration}</span>{" "}
              دقيقة
            </div>
          </div>

          <div className="mt-4 bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4 text-gray-200">
            ❓ عدد الأسئلة:{" "}
            <span className="text-yellow-300 font-bold">{questionsCount}</span>
          </div>

          {/* ✅ عينة أسئلة (بدون إجابات) — تُعرض فقط إذا موجودة بالداتا */}
          {sampleQuestions.length > 0 && (
            <section className="mt-6">
              <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
                عينة من الأسئلة داخل الامتحان
              </h2>

              <div className="mt-3 space-y-3">
                {sampleQuestions.map((q, idx) => (
                  <article
                    key={idx}
                    className="bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-relaxed">
                      {idx + 1}) {q.text}
                    </h3>

                    {q.options?.length > 0 && (
                      <ul className="mt-2 text-xs sm:text-sm text-gray-300 space-y-1">
                        {q.options.map((opt, i) => (
                          <li key={i} className="leading-relaxed">
                            • {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>

              <p className="mt-3 text-xs text-gray-400">
                *هذه عينة فقط من الأسئلة بهدف تعريف المحتوى لمحركات البحث، بدون
                إظهار الإجابات الصحيحة.
              </p>
            </section>
          )}

          {/* ✅ CTA (كما طلبت: بدون زر بدء الامتحان) */}
          <Link
            href="https://wa.link/ghostexams"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
          >
            اشترك الآن
          </Link>

          <div className="mt-3 text-xs text-gray-400">
            هذه صفحة تقدم معلومات الامتحان  — تقديم الامتحان يتم من داخل حساب
            الطالب بعد الاشتراك.
          </div>
        </div>
      </main>
    </div>
  );
}
