"use client";

import Head from "next/head";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { API_URL } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

export async function getServerSideProps({ params }) {
  try {
    const { examId } = params;

    const res = await fetch(`${API_URL}/public/exams/${examId}`);

    if (!res.ok) {
      return {
        redirect: {
          destination: "/tawjihi-2009/english/term-2",
          permanent: true,
        },
      };
    }

    const json = await res.json();

    if (!json?.success || !json?.data) {
      return {
        redirect: {
          destination: "/tawjihi-2009/english/term-2",
          permanent: true,
        },
      };
    }

    return { props: { exam: json.data } };
  } catch {
    return {
      redirect: {
        destination: "/tawjihi-2009/english/term-2",
        permanent: true,
      },
    };
  }
}

export default function EnglishTerm2ExamSEO({ exam }) {
  // ✅ ثوابت الصفحة
  const siteUrl = "https://ghostexams.com";
  const subjectLabel = "اللغة الإنجليزية";
  const subjectSlug = "english";
  const termNumber = 2;
  const termLabel = "الفصل الثاني";

  // ✅ Paths
  const listPagePath = `/tawjihi-2009/${subjectSlug}/term-${termNumber}`;
  const subjectHubPath = `/tawjihi-2009/${subjectSlug}`;
  const tawjihi2009Path = `/tawjihi-2009`;

  // ✅ Canonical
  const examId = exam?._id || "";
  const canonicalUrl = `${siteUrl}${listPagePath}/${examId}`;

  // ✅ Safe values
  const safeExamName = (exam?.examName || "امتحان إنجليزي توجيهي 2009").trim();

  const durationVal = exam?.duration;
  const questionsCountVal = exam?.questionsCount;

  const durationText =
    durationVal !== undefined &&
    durationVal !== null &&
    String(durationVal).trim() !== ""
      ? String(durationVal).trim()
      : "غير محددة";

  const questionsCountText =
    questionsCountVal !== undefined &&
    questionsCountVal !== null &&
    String(questionsCountVal).trim() !== ""
      ? String(questionsCountVal).trim()
      : "غير محدد";

  // ✅ Meta
  const title = `${safeExamName} | امتحان ${subjectLabel} توجيهي 2009 ${termLabel} - GhostExams`;
  const description = `${safeExamName} لمادة ${subjectLabel} (توجيهي 2009 - ${termLabel}). مدة الامتحان: ${durationText} دقيقة، وعدد الأسئلة: ${questionsCountText}. هذه صفحة لشرح تفاصيل الامتحان، وتقديم الامتحان يتم من داخل حساب الطالب بعد تفعيل الاشتراك.`;

  const keywords = [
    safeExamName,
    `امتحان ${subjectLabel} توجيهي 2009 ${termLabel}`,
    `امتحانات ${subjectLabel} توجيهي 2009`,
    `بنك اسئلة ${subjectLabel} توجيهي 2009`,
    "Grammar",
    "Reading",
    "Vocabulary",
    "وزاري تفاعلي",
    "نمط وزاري",
    "حسب المنهاج المعتمد",
    "امتحانات إلكترونية توجيهي الأردن",
    "GhostExams",
  ].join(", ");

  // ✅ OG Image
  const ogImage = `${siteUrl}/og/${subjectSlug}-term-${termNumber}-2009.jpg`;
  const defaultOgImage = `${siteUrl}/og/default.jpg`;

  // ✅ Visible Breadcrumb links
  const crumb = [
    { label: "توجيهي 2009", href: tawjihi2009Path },
    { label: subjectLabel, href: subjectHubPath },
    { label: termLabel, href: listPagePath },
    { label: "معلومات الامتحان", href: `${listPagePath}/${examId}` },
  ];

  // ✅ FAQ (Visible) + FAQ Schema
  const faqItems = useMemo(
    () => [
      {
        q: "هل هذا الامتحان قريب من النمط الوزاري لتوجيهي الأردن؟",
        a: "نعم، الامتحانات مرتبة لتكون قريبة من النمط الوزاري وتساعدك على التدرّب بشكل واقعي.",
      },
      {
        q: "هل المحتوى حسب المنهاج المعتمد لتوجيهي 2009؟",
        a: "نعم، المحتوى مبني على المنهاج الرسمي ومقسّم بما يتوافق مع الوحدات ضمن الفصل.",
      },
      {
        q: "هل أستطيع تقديم الامتحان من هذه الصفحة؟",
        a: "لا. هذه صفحة معلومات مفهرسة فقط. تقديم الامتحان يتم من داخل حساب الطالب بعد تفعيل الاشتراك.",
      },
      {
        q: "هل تظهر الإجابات الصحيحة أثناء الحل؟",
        a: "لا، الهدف محاكاة امتحان وزاري. تظهر النتيجة بعد إنهاء الامتحان من داخل حساب الطالب.",
      },
      {
        q: "هل يغطي الامتحان Grammar وReading وVocabulary؟",
        a: "نعم، الامتحانات تهدف لتغطية المهارات الأساسية المطلوبة في مادة اللغة الإنجليزية لتوجيهي 2009.",
      },
      {
        q: "كيف أفعّل الاشتراك؟",
        a: "اضغط زر (اشترك معنا الآن) للتواصل معنا على واتساب، وسنساعدك بتفعيل الاشتراك بسرعة.",
      },
    ],
    []
  );

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    }),
    [faqItems]
  );

  // ✅ Breadcrumbs JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "توجيهي 2009",
        item: `${siteUrl}${tawjihi2009Path}`,
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

  // ✅ Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: safeExamName,
    description,
    inLanguage: "ar-JO",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    image: [ogImage, defaultOgImage],
    author: {
      "@type": "Organization",
      name: "GhostExams",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "GhostExams",
      url: siteUrl,
    },
  };

  // ✅ Long-tail SEO content
  const seoIntro = `هذا الامتحان ضمن مادة ${subjectLabel} لتوجيهي الأردن 2009 (${termLabel})، وهو جزء من نظام GhostExams الذي يوفّر بنك أسئلة وامتحانات إلكترونية بطريقة وزاري تفاعلي قريبة من النمط الوزاري المعتمد.
إذا كنت تبحث عن "امتحانات إنجليزي توجيهي 2009 فصل ثاني" أو "Tawjihi 2009 English exam" فهذه الصفحة توضّح معلومات الامتحان، بينما التقديم الفعلي يتم من داخل حساب الطالب بعد تفعيل الاشتراك.`;

  // ✅ Related links (internal linking)
  const relatedLinks = [
    {
      label: `صفحة ${subjectLabel} `,
      href: subjectHubPath,
      desc: "روابط الفصول + وصف المادة",
    },
    {
      label: `${termLabel} - قائمة الامتحانات`,
      href: listPagePath,
      desc: "عرض جميع الامتحانات المرتبة داخل الفصل",
    },
    {
      label: `الفصل الأول - ${subjectLabel}`,
      href: `/tawjihi-2009/${subjectSlug}/term-1`,
      desc: "الانتقال لامتحانات الفصل الأول",
    },
    {
      label: "توجيهي 2009 (الصفحة الرئيسية)",
      href: tawjihi2009Path,
      desc: "الرجوع لصفحة توجيهي 2009",
    },
  ];

  // ✅ teacher name (اختياري)
  const teacherName =
    exam?.teacher?.name && String(exam.teacher.name).trim() !== ""
      ? String(exam.teacher.name).trim()
      : null;

  /**
   * ✅ حل Duplicate FAQPage:
   * - بنعرض FAQ JSON-LD مرة واحدة فقط حتى لو كان موجود بكومبوننت آخر.
   */
  const [renderFaqJsonLd, setRenderFaqJsonLd] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ✅ مميز للإنجليزي Term 2 حتى ما يصير تعارض
    const KEY = "__GE_FAQ_JSONLD_EN_T2__";

    if (window[KEY]) {
      setRenderFaqJsonLd(false);
      return;
    }

    window[KEY] = true;
    setRenderFaqJsonLd(true);
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content="ar-JO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* ❌ لا تضع <html lang="ar" /> داخل Head */}

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
          id="breadcrumb-jsonld-en-t2"
          key="breadcrumb-jsonld-en-t2"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          id="article-jsonld-en-t2"
          key="article-jsonld-en-t2"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        {renderFaqJsonLd && (
          <script
            id="faq-jsonld-en-t2"
            key="faq-jsonld-en-t2"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
      </Head>

      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto" dir="rtl">
        {/* ✅ Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href={listPagePath}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/20 hover:border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-300 transition w-full sm:w-auto"
            aria-label="الرجوع لقائمة الامتحانات"
          >
            <span className="text-base">→</span> رجوع
          </Link>

          <div className="text-xs sm:text-sm text-gray-300 w-full sm:w-auto text-center sm:text-left">
            {subjectLabel} 2009 / {termLabel} / معلومات الامتحان
          </div>
        </div>

        {/* ✅ Visible Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-300">
            {crumb.map((c, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Link
                  href={c.href}
                  className="hover:text-yellow-300 transition"
                >
                  {c.label}
                </Link>
                {idx < crumb.length - 1 && (
                  <span className="text-gray-500">›</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ✅ Main Card */}
        <div className="bg-gray-800/70 border border-yellow-500/15 rounded-2xl p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-400 leading-snug">
            {safeExamName}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">
            هذه صفحة معلومات لتوضيح بيانات الامتحان . تقديم الامتحان يتم
            من داخل حساب الطالب بعد تفعيل الاشتراك.
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
              <span className="text-yellow-300 font-bold">{durationText}</span>{" "}
              {durationText !== "غير محددة" ? "دقيقة" : ""}
            </div>
          </div>

          <div className="mt-4 bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4 text-gray-200">
            ❓ عدد الأسئلة:{" "}
            <span className="text-yellow-300 font-bold">
              {questionsCountText}
            </span>
          </div>

          {teacherName && (
            <div className="mt-3 bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4 text-gray-200">
              👩‍🏫 المعلم:{" "}
              <span className="text-yellow-300 font-bold">{teacherName}</span>
            </div>
          )}

          {/* ✅ CTA */}
          <Link
            href="/auth/Register"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
          >
            اشترك معنا الآن
          </Link>

          <div className="mt-4 text-xs text-blue-400 font-bold leading-relaxed">
            هذه الصفحة تعرض معلومات الامتحان فقط — تقديم الامتحان يتم من داخل
            حساب الطالب بعد تفعيل الاشتراك.
            <br />
            لتفعيل الاشتراك اضغط على الزر (اشترك معنا الآن) وسنساعدك فورًا.
          </div>
        </div>

        {/* ✅ Long-tail SEO Content */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            امتحان {subjectLabel} توجيهي 2009 {termLabel} — Grammar / Reading /
            Vocabulary
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line">
            {seoIntro}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedLinks.map((l, idx) => (
              <Link
                key={idx}
                href={l.href}
                className="group bg-gray-900/40 hover:bg-gray-900/60 border border-yellow-500/10 hover:border-yellow-500/25 rounded-xl p-4 transition"
                aria-label={l.label}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm sm:text-base font-extrabold text-yellow-200">
                      {l.label}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {l.desc}
                    </div>
                  </div>
                  <span className="text-yellow-300 group-hover:translate-x-1 transition">
                    ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ✅ FAQ Section (Visible فقط - والـ JSON-LD صار guarded بالأعلى) */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            أسئلة شائعة عن امتحانات {subjectLabel} توجيهي 2009
          </h2>

          <div className="mt-4 space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4"
              >
                <summary className="cursor-pointer text-sm sm:text-base font-bold text-gray-100">
                  {item.q}
                </summary>
                <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}