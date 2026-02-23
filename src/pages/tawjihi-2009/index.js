"use client";

// 📁 المسار: frontend/src/pages/tawjihi-2009/index.js

import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Tawjihi2009Index() {
  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/tawjihi-2009`;

  // ✅ غيّرهم حسب وضعك الحقيقي
  const WHATSAPP_URL = "https://wa.me/962791515106";
  const ABOUT_URL = "/about"; // إذا عندك صفحة "من نحن"
  const CONTACT_URL = "/contact"; // إذا عندك صفحة تواصل
  const LOGO_URL = `${siteUrl}/logo.png`; // حط لوجو حقيقي داخل public
  const ogImage = `${siteUrl}/og/tawjihi-2009.jpg`;

  const seoTitle =
    "توجيهي 2009 | بنك أسئلة وامتحانات تفاعلية (عربي/إنجليزي/دين/تاريخ الأردن) - GhostExams";
  const seoDescription =
    "بوابة توجيهي الأردن 2009 على GhostExams: اختر المادة ثم الفصل للوصول لقائمة الامتحانات وبنوك الأسئلة التفاعلية (عربي، إنجليزي، دين، تاريخ الأردن) مع معاينة مدة الامتحان وعدد الأسئلة.";

  const keywords = [
    "توجيهي 2009",
    "امتحانات توجيهي 2009 الأردن",
    "بنك اسئلة توجيهي 2009",
    "بنوك أسئلة توجيهي 2009",
    "امتحانات عربي توجيهي 2009",
    "امتحانات انجليزي توجيهي 2009",
    "امتحانات دين توجيهي 2009",
    "امتحانات تاريخ الأردن توجيهي 2009",
    "امتحانات تفاعلية توجيهي",
    "GhostExams",
  ].join(", ");

  const subjects = [
    {
      title: "بنك أسئلة وامتحانات تاريخ الأردن توجيهي 2009",
      emoji: "🇯🇴",
      subjectLabel: "تاريخ الأردن",
      subjectSlug: "/tawjihi-2009/jordan-history",
      term1: "/tawjihi-2009/jordan-history/term-1",
      term2: "/tawjihi-2009/jordan-history/term-2",
    },
    {
      title: "بنك أسئلة وامتحانات إنجليزي توجيهي 2009",
      emoji: "🇬🇧",
      subjectLabel: "اللغة الإنجليزية",
      subjectSlug: "/tawjihi-2009/english",
      term1: "/tawjihi-2009/english/term-1",
      term2: "/tawjihi-2009/english/term-2",
    },
    {
      title: "بنك أسئلة وامتحانات عربي توجيهي 2009",
      emoji: "📚",
      subjectLabel: "اللغة العربية",
      subjectSlug: "/tawjihi-2009/arabic",
      term1: "/tawjihi-2009/arabic/term-1",
      term2: "/tawjihi-2009/arabic/term-2",
    },
    {
      title: "بنك أسئلة وامتحانات دين (تربية إسلامية) توجيهي 2009",
      emoji: "🕌",
      subjectLabel: "التربية الإسلامية",
      subjectSlug: "/tawjihi-2009/islamic",
      term1: "/tawjihi-2009/islamic/term-1",
      term2: "/tawjihi-2009/islamic/term-2",
    },
  ];

  // ✅ محتوى مفهرس (قصير + واضح)
  const introText = `هذه هي بوابة توجيهي الأردن 2009 على GhostExams.
من هنا بتختار المادة (عربي/إنجليزي/دين/تاريخ الأردن) ثم الفصل (الأول أو الثاني) للوصول مباشرة لقائمة الامتحانات.
كل صفحة فصل تحتوي على كروت امتحانات وتساعدك تختار بسرعة حسب الوحدة/الكتاب.`;

  // ✅ محتوى أطول (Long-tail SEO) بدون حشو
  const longSeoText =
    `إذا كنت تبحث عن "أفضل بنك أسئلة توجيهي 2009" أو "امتحانات توجيهي 2009 الأردن"، ` +
    `فصفحة توجيهي 2009 في GhostExams تجمع لك المواد الأساسية بروابط مباشرة لكل فصل. ` +
    `داخل صفحات الفصول ستجد قائمة الامتحانات مع معاينة مدة الامتحان وعدد الأسئلة قبل البدء. ` +
    `أما تقديم الامتحان الفعلي فيكون من داخل حساب الطالب بعد تفعيل الاشتراك، حتى تضمن تجربة منظمة وتتبع لنتائجك.`;

  const crumb = [
    { label: "GhostExams", href: "/" },
    { label: "توجيهي 2009", href: "/tawjihi-2009" },
  ];

  // ✅ أقسام SEO المطلوبة (H2)
  const whyUsText = `موقع GhostExams اول موقع اردني قدر يدمج الذكاء الاصطناعي مع الذكاء الانساني (معلمين ) لانتاج افضل محتوى تعليمي لطلاب التوجيهي صف 11 في الاردن - الاسئلة مكتوبة من المنهاج المعتمد وحسب النمط الوزاري على شكل اسئلة متعدد الاختيارات وامتحانات تفاعلية حسب تفاعل الطالب مع السؤال - عملنا تجربة تحاكي النمط الوزاري الحقيقي لاول مرة في الاردن`;

  const howToChooseText = `ابدأ باختيار المادة من الكروت بالأسفل، ثم اختر الفصل الأول أو الثاني.
ستنتقل مباشرة إلى صفحة الفصل التي تحتوي كروت الامتحانات، وبعدها تختار الامتحان المناسب وتبدأ من داخل حساب الطالب.`;

  const qualityPolicyText = `بعد ما تم تعليم ال Ai كل المنهاج بشكل دقيق وتدقيقها من معلمين مختصين للمواد ، ال Ai قدر يكتب اسئلة قوية مع مشتتات منطقية حتى نضمن جودة الاسئلة وجودة الخيارات ، كل الامتحانات متسواها ما بين سهل متوسط عالي وقدرات بشكل غير مرتب لضمان عدم سهولة الحل من الطلاب ، والمتحوى يحاكي كل طبقات الطلاب ويركز على الفهم والحفظ والاسترجاع والربط ما بين المواد ، دائما نعمل على تنظيم الامتحانات وتجهيزها بصيغة واضحة للطالب، مع تقليل الأخطاء قدر الإمكان، وتحسين عرض الامتحانات بشكل مستمر. أي ملاحظة أو خطأ يتم التعامل معه وتحديثه ضمن تحسينات دورية للمنصة.`;

  // ✅ شهادات بسيطة (بدون مبالغة)
  const testimonials = [
    {
      name: "مهند طالب توجيهي 2009",
      text: "الامتحانات مرتبة وبعرف أختار الامتحان بسرعة بدون ما أتوه.",
    },
    {
      name: "يافا طالبة توجيهي 2009",
      text: "طريقة تقديم الامتحانات رهيبة بقدر اكمل امتحاني باي وقت .",
    },
    {
      name: "عبدالله طالب توجيهي",
      text: "التقسيم حسب الوحدة خفف علي كثير بالبحث والمراجعة.",
    },
    {
      name: "احمد العلي ولي أمر",
      text: "صار عندي مكان واحد مرتب لمتابعة امتحانات المواد الأساسية.",
    },
    {
      name: "نبيل طالب",
      text: "مريح خلصت من الدوسيات الورقية وصار كله عالموبايل وسهل التنقل بين الفصول.",
    },
    {
      name: "تولين طالبة",
      text: "ما توقعت اسلوب الاسئلة مبين متعوب عليهم مش قليل هال Ai جد ذكي.",
    },
    {
      name: "يارا طالبة",
      text: "يمكن اول مرة بستفيد من موقع امتحانات كل الى موجود معبا دعايات بدوخ وانا ادرس.",
    },
    {
      name: "ولاء طالبة",
      text: "صار عندي عادة كل شوي افتح امتحن من هون لاخر الفصل بكون حفظت كل الاسئلة.",
    },
  ];

  // ✅ FAQ
  const faqItems = [
    {
      q: "كيف أوصل لامتحانات توجيهي 2009 بسرعة؟",
      a: "اختر المادة من الكروت، ثم اختر الفصل الأول أو الثاني لفتح صفحة الامتحانات مباشرة.",
    },
    {
      q: "هل أستطيع تقديم الامتحان من هذه الصفحة؟",
      a: "هذه الصفحة بوابة للتنقل. تقديم الامتحان الفعلي يتم من داخل حساب الطالب بعد تفعيل الاشتراك.",
    },
    {
      q: "هل صفحات الفصول تعرض كل الامتحانات؟",
      a: "نعم، صفحة كل فصل تعرض قائمة الامتحانات على شكل كروت، مع معاينة بيانات الامتحان مثل المدة وعدد الأسئلة.",
    },
    {
      q: "كيف أتواصل لتفعيل الاشتراك أو الاستفسار؟",
      a: "اضغط على زر (اشترك معنا الآن) للتواصل عبر واتساب وسنساعدك فورًا.",
    },
  ];

  // ✅ JSON-LD: CollectionPage
  const jsonLdCollectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoTitle,
    url: canonicalUrl,
    description: seoDescription,
    inLanguage: "ar-JO",
    isPartOf: { "@type": "WebSite", name: "GhostExams", url: siteUrl },
    about: subjects.map((s) => ({ "@type": "Thing", name: s.subjectLabel })),
    primaryImageOfPage: { "@type": "ImageObject", url: ogImage },
  };

  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GhostExams", item: siteUrl },
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
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: subjects.length,
    itemListElement: subjects.map((s, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: s.title,
      url: `${siteUrl}${s.subjectSlug}`,
    })),
  };

  // ✅ JSON-LD: FAQPage
  const jsonLdFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  // ✅ JSON-LD: Organization + WebSite (ثقة)
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GhostExams",
    url: siteUrl,
    logo: LOGO_URL,
    sameAs: [
      // حط روابطك الحقيقية إذا موجودة
      // "https://www.facebook.com/YourPage",
      // "https://www.instagram.com/YourPage",
      // "https://www.tiktok.com/@YourPage",
      // "https://www.youtube.com/@YourPage",
    ],
  };

  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GhostExams",
    url: siteUrl,
    inLanguage: "ar-JO",
    // ✅ SearchAction اختياري (لو عندك صفحة بحث داخل الموقع)
    // potentialAction: {
    //   "@type": "SearchAction",
    //   target: `${siteUrl}/search?q={search_term_string}`,
    //   "query-input": "required name=search_term_string",
    // },
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>{seoTitle}</title>

        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content="ar-JO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_JO" />
        <meta property="og:site_name" content="GhostExams" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta
          property="og:image:alt"
          content="GhostExams | بوابة توجيهي 2009"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta
          name="twitter:image:alt"
          content="GhostExams | بوابة توجيهي 2009"
        />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdCollectionPage),
          }}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrganization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </Head>

      <Navbar />

      <main dir="rtl" className="pt-24 pb-14 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Breadcrumbs (visible) */}
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-400">
          بوابة توجيهي 2009
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-200 max-w-4xl leading-relaxed whitespace-pre-line">
          {introText}
        </p>

        <p className="mt-3 text-xs sm:text-sm text-gray-400">
          ملاحظة: صفحات الفصول تعرض قائمة الامتحانات ومعاينة كل امتحان — تقديم
          الامتحان يتم من داخل حساب الطالب بعد تفعيل الاشتراك.
        </p>

        {/* كروت المواد */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((s) => (
            <article
              key={s.subjectSlug}
              className="bg-gray-800/70 border border-yellow-500/15 hover:border-yellow-500/30 rounded-2xl p-5 shadow-lg transition"
            >
              <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300">
                <Link
                  href={s.subjectSlug}
                  className="hover:text-yellow-200 transition"
                >
                  {s.emoji} {s.title}
                </Link>
              </h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={s.term1}
                  className="inline-flex justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2.5"
                  aria-label={`فتح ${s.subjectLabel} - الفصل الأول`}
                >
                  الفصل الأول
                </Link>

                <Link
                  href={s.term2}
                  className="inline-flex justify-center rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5"
                  aria-label={`فتح ${s.subjectLabel} - الفصل الثاني`}
                >
                  الفصل الثاني
                </Link>
              </div>

              <div className="mt-3 text-xs text-gray-300/80">
                <Link href={s.subjectSlug} className="hover:text-yellow-300">
                  صفحة المادة →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ✅ أقسام H2 مفهرسة */}
        <section className="mt-10 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            ليش موقع امتحانات GhostExams لتوجيهي 2009 يعتبر الافضل والاحدث
            والأقوى؟
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line">
            {whyUsText}
          </p>
        </section>

        <section className="mt-6 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            كيف تختار المادة والفصل؟
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line">
            {howToChooseText}
          </p>
        </section>

        <section className="mt-6 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            كيف نضمن جودة بنك الأسئلة؟
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line">
            {qualityPolicyText}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={ABOUT_URL}
              className="inline-flex rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 text-sm"
            >
              من نحن
            </Link>
            <Link
              href={CONTACT_URL}
              className="inline-flex rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 text-sm"
            >
              تواصل معنا
            </Link>
            <a
              href={WHATSAPP_URL}
              className="inline-flex rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              واتساب مباشر
            </a>
          </div>
        </section>

        {/* ✅ شهادات */}
        <section className="mt-6 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            آراء بعض طلابنا عن موقعنا والامتحانات والاسئلة المكتوبة
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                className="bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4"
              >
                <blockquote className="text-sm text-gray-200 leading-relaxed">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-2 text-xs text-gray-400">
                  — {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* CTA */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
        >
          اشترك معنا الآن
        </a>

        {/* Long-tail SEO */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            امتحانات توجيهي 2009 الأردن — مواد مرتبة وروابط مباشرة لكل فصل
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">
            {longSeoText}
          </p>
        </section>

        {/* FAQ مرئي */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            أسئلة شائعة عن توجيهي 2009 على GhostExams
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

        <p className="mt-8 text-xs text-gray-400 text-center">
          GhostExams — بوابة المواد والفصول لتوجيهي الأردن 2009.
        </p>
      </main>
    </div>
  );
}
