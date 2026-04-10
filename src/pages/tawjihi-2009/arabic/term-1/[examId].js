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
          destination: "/tawjihi-2009/arabic/term-1",
          permanent: true,
        },
      };
    }

    const json = await res.json();

    if (!json?.success || !json?.data) {
      return {
        redirect: {
          destination: "/tawjihi-2009/arabic/term-1",
          permanent: true,
        },
      };
    }

    return { props: { exam: json.data } };
  } catch {
    return {
      redirect: {
        destination: "/tawjihi-2009/arabic/term-1",
        permanent: true,
      },
    };
  }
}

export default function ArabicTerm1ExamSEO({ exam }) {
  const siteUrl = "https://ghostexams.com";
  const subjectLabel = "اللغة العربية";
  const subjectSlug = "arabic";
  const termNumber = 1;
  const termLabel = "الفصل الأول";

  const listPagePath = `/tawjihi-2009/${subjectSlug}/term-${termNumber}`;
  const subjectHubPath = `/tawjihi-2009/${subjectSlug}`;
  const tawjihi2009Path = `/tawjihi-2009`;

  const examId = exam?._id || "";
  const canonicalUrl = `${siteUrl}${listPagePath}/${examId}`;

  const safeExamName = (exam?.examName || "امتحان عربي توجيهي 2009").trim();
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

  const title = `${safeExamName} | امتحان ${subjectLabel} توجيهي 2009 ${termLabel} - GhostExams`;
  const description = `${safeExamName} لمادة ${subjectLabel} (توجيهي 2009 - ${termLabel}). مدة الامتحان: ${durationText} دقيقة، وعدد الأسئلة: ${questionsCountText}. هذه صفحة لشرح تفاصيل الامتحان، وتقديم الامتحان يتم من داخل حساب الطالب بعد تفعيل الاشتراك.`;

  const keywords = [
    `امتحان ${subjectLabel} توجيهي 2009 ${termLabel}`,
    `امتحانات ${subjectLabel} توجيهي 2009`,
    `بنك اسئلة ${subjectLabel} توجيهي 2009`,
    "وزاري تفاعلي",
    "نمط وزاري",
    "حسب المنهاج المعتمد",
    "امتحانات الكترونية توجيهي الأردن",
    "GhostExams",
  ].join(", ");

  const ogImage = `${siteUrl}/og/${subjectSlug}-term-${termNumber}-2009.jpg`;
  const defaultOgImage = `${siteUrl}/og/default.jpg`;

  const crumb = [
    { label: "توجيهي 2009", href: tawjihi2009Path },
    { label: subjectLabel, href: subjectHubPath },
    { label: termLabel, href: listPagePath },
    { label: "معلومات الامتحان", href: `${listPagePath}/${examId}` },
  ];

  const faqItems = useMemo(
    () => [
      {
        q: "هل هذا الامتحان مطابق للنمط الوزاري؟",
        a: "نعم، الامتحانات مرتبة ومصممة لتكون قريبة من النمط الوزاري المعتمد لتوجيهي الأردن 2009.",
      },
      {
        q: "هل المحتوى حسب المنهاج المعتمد؟",
        a: "نعم، المحتوى مبني على المنهاج الرسمي ومقسّم بما يتوافق مع الوحدات والدروس ضمن الفصل.",
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
        q: "ما الفرق بين بنك أسئلة وامتحانات؟",
        a: "بنك الأسئلة يركز على تدريب واسع حسب الدروس، بينما الامتحانات تجمع أسئلة بنمط وزاري لمحاكاة الامتحان الحقيقي.",
      },
      {
        q: "كيف أفعّل الاشتراك؟",
        a: "اضغط زر (اشترك معنا الآن) للتواصل معنا على واتساب، وسنساعدك بتفعيل الاشتراك بسرعة.",
      },
    ],
    [],
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
    [faqItems],
  );

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

  const seoIntro = `هذا الامتحان ضمن مادة ${subjectLabel} لتوجيهي الأردن 2009 (${termLabel})، وهو جزء من نظام GhostExams الذي يوفّر بنك أسئلة وبنوك أسئلة وامتحانات إلكترونية بطريقة وزاري تفاعلي قريبة من النمط الوزاري المعتمد.
إذا كنت تبحث عن "امتحانات عربي توجيهي 2009 فصل أول" أو "امتحان وزاري عربي 2009" فهذه الصفحة توضّح معلومات الامتحان، بينما التقديم الفعلي يتم من داخل حساب الطالب بعد تفعيل الاشتراك.`;

  const relatedLinks = [
    {
      label: `صفحة ${subjectLabel}`,
      href: subjectHubPath,
      desc: "روابط الفصول + وصف المادة",
    },
    {
      label: `${termLabel} - قائمة الامتحانات`,
      href: listPagePath,
      desc: "عرض جميع الامتحانات المرتبة داخل الفصل",
    },
    {
      label: `الفصل الثاني - ${subjectLabel}`,
      href: `/tawjihi-2009/${subjectSlug}/term-2`,
      desc: "الانتقال لامتحانات الفصل الثاني",
    },
    {
      label: "توجيهي 2009 (الصفحة الرئيسية)",
      href: tawjihi2009Path,
      desc: "الرجوع لصفحة توجيهي 2009",
    },
  ];

  const [renderFaqJsonLd, setRenderFaqJsonLd] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const KEY = "__GE_FAQ_JSONLD_AR_T1__";

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

        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:locale" content="ar_JO" />
        <meta property="og:site_name" content="GhostExams" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        <script
          id="breadcrumb-jsonld-ar-t1"
          key="breadcrumb-jsonld-ar-t1"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          id="article-jsonld-ar-t1"
          key="article-jsonld-ar-t1"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        {renderFaqJsonLd && (
          <script
            id="faq-jsonld-ar-t1"
            key="faq-jsonld-ar-t1"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
      </Head>

      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto" dir="rtl">
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

        <div className="bg-gray-800/70 border border-yellow-500/15 rounded-2xl p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-400 leading-snug">
            {safeExamName}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">
            هذه صفحة معلومات لتوضيح بيانات الامتحان . تقديم الامتحان يتم من داخل
            حساب الطالب بعد تفعيل الاشتراك.
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

        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            امتحان {subjectLabel} توجيهي 2009 {termLabel} — وزاري تفاعلي
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
