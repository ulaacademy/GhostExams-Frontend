"use client";

import Head from "next/head";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { API_URL } from "@/services/api";

export async function getServerSideProps() {
  const subject = "arabic";
  const term = "2";
  const grade = "2009";

  const buildUrl = (params) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_URL}/public/exams?${qs}`;
  };

  try {
    const url1 = buildUrl({ subject, term, grade });
    const res1 = await fetch(url1);
    const json1 = await res1.json();
    const exams1 = json1?.success ? json1.data : [];

    // ✅ fallback لو بيانات grade مش موحّدة
    if (!exams1 || exams1.length === 0) {
      const url2 = buildUrl({ subject, term });
      const res2 = await fetch(url2);
      const json2 = await res2.json();
      const exams2 = json2?.success ? json2.data : [];
      return { props: { exams: exams2 || [], usedFallback: true } };
    }

    return { props: { exams: exams1, usedFallback: false } };
  } catch {
    return { props: { exams: [], usedFallback: false } };
  }
}

export default function ArabicTerm2({ exams, usedFallback }) {
  // ✅ ثوابت الصفحة
  const siteUrl = "https://ghostexams.com";
  const subjectLabel = "اللغة العربية";
  const subjectShort = "عربي";
  const subjectSlug = "arabic";
  const termNumber = 2;
  const termLabel = "الفصل الثاني";

  // ✅ Paths
  const listPagePath = `/tawjihi-2009/${subjectSlug}/term-${termNumber}`;
  const subjectHubPath = `/tawjihi-2009/${subjectSlug}`;
  const tawjihi2009Path = `/tawjihi-2009`;

  // ✅ Canonical
  const canonicalUrl = `${siteUrl}${listPagePath}`;

  // ✅ Meta
  const title = `امتحانات ${subjectShort} توجيهي 2009 | ${termLabel} - GhostExams`;
  const description =
    `قائمة امتحانات ${subjectLabel} لتوجيهي الأردن 2009 (${termLabel}). ` +
    `اختر الامتحان حسب الوحدة/الكتاب واعرض معاينة الامتحان. تقديم الامتحان الفعلي يتم من داخل حساب الطالب بعد تفعيل الاشتراك.`;

  const keywords = [
    `امتحانات ${subjectLabel} توجيهي 2009`,
    `بنك اسئلة ${subjectLabel} توجيهي 2009`,
    `امتحانات ${subjectShort} 2009 ${termLabel}`,
    "امتحانات الكترونية توجيهي الأردن",
    "امتحان وزاري تفاعلي",
    "نمط وزاري",
    "حسب المنهاج المعتمد",
    "GhostExams",
  ].join(", ");

  // ✅ OG Image
  const ogImage = `${siteUrl}/og/${subjectSlug}-term-${termNumber}-2009.jpg`;
  const defaultOgImage = `${siteUrl}/og/default.jpg`;

  // ✅ نص تعريفي (SEO قابل للفهرسة)
  const introText = `هذه صفحة امتحانات ${subjectLabel} لتوجيهي الأردن 2009 (${termLabel}) على GhostExams.
ستجد هنا الامتحانات الحقيقية الموجودة بالموقع مرتبة حسب أسماء الوحدات/الكتاب، مع مدة الامتحان وعدد الأسئلة.
اعرض معاينة أي امتحان من الكروت، أما التقديم الفعلي فيكون من داخل حساب الطالب بعد تفعيل الاشتراك.`;

  // ✅ Visible Breadcrumbs
  const crumb = [
    { label: "توجيهي 2009", href: tawjihi2009Path },
    { label: subjectLabel, href: subjectHubPath },
    { label: termLabel, href: listPagePath },
  ];

  // ✅ FAQ (Visible) + FAQ Schema
  const faqItems = [
    {
      q: `هل امتحانات ${subjectShort} هنا قريبة من النمط الوزاري؟`,
      a: "نعم، الامتحانات مصممة لتكون قريبة من النمط الوزاري وتساعدك على التدريب بشكل واقعي.",
    },
    {
      q: "هل المحتوى حسب المنهاج المعتمد لتوجيهي 2009؟",
      a: "نعم، المحتوى مبني على المنهاج الرسمي ومقسّم بما يتوافق مع وحدات الفصل.",
    },
    {
      q: "هل أستطيع تقديم الامتحان من هذه الصفحة؟",
      a: "هذه الصفحة مخصصة لعرض قائمة الامتحانات ومعاينة كل امتحان. التقديم الفعلي يتم من داخل حساب الطالب بعد تفعيل الاشتراك.",
    },
    {
      q: "كيف أفعّل الاشتراك؟",
      a: "اضغط زر (اشترك معنا الآن) للتواصل معنا على واتساب، وسنساعدك بتفعيل الاشتراك بسرعة.",
    },
  ];

  const faqJsonLd = {
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
  };

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
        item: canonicalUrl,
      },
    ],
  };

  // ✅ ItemList JSON-LD (قائمة الامتحانات)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `امتحانات ${subjectShort} توجيهي 2009 - ${termLabel}`,
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: Array.isArray(exams) ? exams.length : 0,
    itemListElement: (exams || []).map((exam, idx) => {
      const previewUrl = `${siteUrl}${listPagePath}/${exam?._id}`;
      return {
        "@type": "ListItem",
        position: idx + 1,
        name: (exam?.examName || `امتحان ${subjectShort} ${idx + 1}`).trim(),
        url: previewUrl,
      };
    }),
  };

  // ✅ CollectionPage JSON-LD (أفضل لصفحات القوائم)
  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: canonicalUrl,
    inLanguage: "ar-JO",
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "GhostExams",
      url: siteUrl,
    },
    about: [
      { "@type": "Thing", name: `امتحانات ${subjectLabel} توجيهي 2009` },
      { "@type": "Thing", name: termLabel },
    ],
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: ogImage,
    },
  };

  // ✅ روابط داخلية قوية
  const relatedLinks = [
    {
      label: `صفحة ${subjectLabel}`,
      href: subjectHubPath,
      desc: "روابط الفصول + وصف المادة",
    },
    {
      label: `الفصل الأول - ${subjectShort}`,
      href: `/tawjihi-2009/${subjectSlug}/term-1`,
      desc: "الانتقال لقائمة امتحانات الفصل الأول",
    },
    {
      label: "توجيهي 2009 (الصفحة الرئيسية)",
      href: tawjihi2009Path,
      desc: "الرجوع لصفحة توجيهي 2009",
    },
  ];

  // ✅ Long-tail SEO Content
  const seoIntro =
    `إذا كنت تبحث عن "امتحانات ${subjectShort} توجيهي 2009 ${termLabel}" أو "بنك أسئلة ${subjectShort} 2009"، ` +
    `فهذه الصفحة تجمع الامتحانات المرتبة حسب الوحدات وتعرض معاينة لكل امتحان مع المدة وعدد الأسئلة. ` +
    `التجربة الفعلية (حل الامتحان) تتم من داخل حساب الطالب بعد تفعيل الاشتراك.`;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content="ar-JO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <html lang="ar" />

        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_JO" />
        <meta property="og:site_name" content="GhostExams" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta
          property="og:image:alt"
          content={`امتحانات ${subjectShort} توجيهي 2009 ${termLabel}`}
        />
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionPageJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Navbar />

      {/* ✅ Mobile Optimized + RTL */}
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto" dir="rtl">
        {/* ✅ Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href={subjectHubPath}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/20 hover:border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-300 transition w-full sm:w-auto"
            aria-label="الرجوع لصفحة المادة"
          >
            <span className="text-base">→</span> رجوع
          </Link>

          <div className="text-xs sm:text-sm text-gray-300 w-full sm:w-auto text-center sm:text-left">
            {subjectShort} 2009 / {termLabel}
          </div>
        </div>

        {/* ✅ Visible Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-300">
            {crumb.map((c, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Link href={c.href} className="hover:text-yellow-300 transition">
                  {c.label}
                </Link>
                {idx < crumb.length - 1 && (
                  <span className="text-gray-500">›</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ✅ Header */}
        <header className="text-center px-1 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-400 leading-snug sm:leading-tight">
            امتحانات {subjectShort} توجيهي 2009 — {termLabel}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-4xl mx-auto leading-7 sm:leading-relaxed text-center whitespace-pre-line">
            {introText}
          </p>

          <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-7 sm:leading-relaxed text-center">
            عدد الامتحانات:
            <span className="mx-2 text-yellow-300 font-extrabold">
              {Array.isArray(exams) ? exams.length : 0}
            </span>
          </p>

          {usedFallback && (
            <div className="mt-3 text-xs sm:text-sm text-yellow-300/90">
              ✅ ملاحظة: تم عرض النتائج بدون فلتر الصف لأن قيم الصف في الداتا ليست
              موحدة.
            </div>
          )}
        </header>

        {/* ✅ Exams Grid */}
        {!exams || exams.length === 0 ? (
          <div className="mt-8 bg-gray-800/60 border border-yellow-500/15 rounded-2xl p-6 text-gray-300 text-center">
            لا توجد امتحانات حالياً لـ {subjectShort} ({termLabel}).
          </div>
        ) : (
          <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exams.map((exam, idx) => {
              const examId = exam?._id;
              const examName =
                (exam?.examName && String(exam.examName).trim() !== ""
                  ? String(exam.examName).trim()
                  : `امتحان ${subjectShort} ${idx + 1}`) || `امتحان ${subjectShort}`;

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

              const previewHref = `${listPagePath}/${examId}`;

              const seoCardText = `امتحان ${subjectShort} توجيهي 2009 (${termLabel}) — ${examName}. مدة الامتحان: ${durationText} دقيقة، وعدد الأسئلة: ${questionsCountText}.`;

              return (
                <article
                  key={examId || idx}
                  className="bg-gray-800/70 border border-yellow-500/15 hover:border-yellow-500/40 rounded-2xl p-5 sm:p-6 transition shadow-lg flex flex-col min-h-[240px]"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300 leading-snug line-clamp-2">
                    {examName}
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {seoCardText}
                  </p>

                  <div className="mt-3 text-sm text-gray-300 space-y-1">
                    <p>
                      ⏱️ المدة: {durationText}
                      {durationText !== "غير محددة" ? " دقيقة" : ""}
                    </p>
                    <p>🧠 عدد الأسئلة: {questionsCountText}</p>
                    <p className="text-xs text-gray-400">
                      📌 الفصل: {exam?.term || termNumber}
                    </p>
                  </div>

                  {Array.isArray(exam.sampleQuestions) &&
                    exam.sampleQuestions.length > 0 && (
                      <div className="mt-3 bg-gray-900/40 border border-yellow-500/10 rounded-xl p-3">
                        <div className="text-xs text-yellow-200 font-bold mb-2">
                          أمثلة أسئلة من الامتحان:
                        </div>
                        <ul className="text-xs text-gray-200 space-y-2">
                          {exam.sampleQuestions.slice(0, 3).map((q, i) => (
                            <li key={i} className="line-clamp-2">
                              • {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* ✅ IMPORTANT: Link وليس button (SEO) */}
                  <Link
                    href={previewHref}
                    className="mt-4 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
                    aria-label={`عرض معاينة الامتحان: ${examName}`}
                  >
                    عرض الامتحان (معاينة)
                  </Link>
                </article>
              );
            })}
          </section>
        )}

        {/* ✅ CTA */}
        <Link
          href="https://wa.link/ghostexams"
          className="mt-10 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
        >
          اشترك معنا الآن
        </Link>

        <div className="mt-4 text-xs text-blue-400 font-bold leading-relaxed text-center">
          هذه الصفحة تعرض قائمة الامتحانات ومعاينة كل امتحان فقط — تقديم الامتحان
          يتم من داخل حساب الطالب بعد تفعيل الاشتراك.
          <br />
          لتفعيل الاشتراك اضغط على الزر (اشترك معنا الآن) وسنساعدك فورًا.
        </div>

        {/* ✅ Long-tail SEO Content */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            امتحانات {subjectLabel} توجيهي 2009 {termLabel} — بنك أسئلة مرتب حسب
            الوحدات
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

        {/* ✅ FAQ Section */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            أسئلة شائعة عن امتحانات {subjectShort} توجيهي 2009
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

        {/* ✅ صغيرة: صورة بديلة OG (اختياري) */}
        <div className="sr-only">
          <img
            src={ogImage}
            alt={`امتحانات ${subjectShort} توجيهي 2009 ${termLabel}`}
          />
          <img src={defaultOgImage} alt="GhostExams" />
        </div>
      </main>
    </div>
  );
}