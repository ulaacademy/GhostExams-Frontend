import Head from "next/head";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Tawjihi2009JordanHistory() {
  const router = useRouter();

  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/tawjihi-2009/jordan-history`;

  const title =
    "امتحانات تاريخ الأردن توجيهي 2009 | بنك أسئلة + فصل أول/ثاني - GhostExams";

  const description =
    "امتحانات إلكترونية وبنك أسئلة تاريخ الأردن لتوجيهي 2009 في الأردن. وزاري تفاعلي قريب من النمط الوزاري المعتمد ومقسّم حسب المنهاج المعتمد. اختر الفصل (الأول/الثاني) واستعرض الامتحانات حسب الوحدة.";

  const keywords =
    "امتحانات تاريخ الاردن توجيهي 2009, امتحانات تاريخ الأردن توجيهي 2009, بنك اسئلة تاريخ الاردن, بنك أسئلة تاريخ الأردن, امتحانات وزارية تاريخ الأردن, نمط الوزارة تاريخ الأردن, توجيهي الاردن 2009 تاريخ, احداث وتواريخ ومعاهدات, اسئلة وزارية تاريخ الأردن, وزاري تفاعلي, نمط وزاري, اسئلة تفاعلية, حسب النمط الوزاري, حسب المنهاج المعتمد";

  const term1Url = "/tawjihi-2009/jordan-history/term-1";
  const term2Url = "/tawjihi-2009/jordan-history/term-2";

  const tawjihi2009Hub = "/";

  // ✅ OG Image: public/og/jordan-history-2009.jpg
  const ogImage = `${siteUrl}/og/jordan-history-2009.jpg`;

  const introText = `GhostExams توفر امتحانات تاريخ الأردن لتوجيهي 2009 بصيغة إلكترونية، مع بنك أسئلة منظم يساعدك على تثبيت الأحداث وفهم التسلسل الزمني بدقة.
ستجد هنا الامتحانات مرتبة حسب الفصل الأول والفصل الثاني والوحدات أيضًا، لتراجع بطريقة منظمة وتعرف نقاط الضعف بسرعة.
الامتحانات مصممة لتقيس فهمك وتدربك على طبيعة السؤال والخيارات المتوقعة وفق النمط الوزاري، حتى تدخل الامتحان بثقة أعلى.`;

  // ✅ نص إضافي لتقوية الكلمات الطويلة داخل المحتوى
  const seoIntroShort =
    "هذا بنك أسئلة تاريخ الأردن لتوجيهي 2009 مصمم بأسلوب وزاري تفاعلي قريب من النمط الوزاري المعتمد. ستجد أسئلة تفاعلية مرتبة حسب المنهاج المعتمد تشمل الأحداث والتواريخ والمعاهدات والشخصيات، مع نماذج امتحانات تساعدك على التدريب بسرعة على الموبايل أو الكمبيوتر.";

  // ✅ روابط Long-tail داخلية (بدون صفحات جديدة)
  const quickLinks = [
    {
      label: "امتحانات تاريخ الأردن توجيهي 2009 فصل أول – وزاري تفاعلي",
      href: term1Url,
    },
    {
      label: "امتحان تاريخ الأردن توجيهي 2009 فصل ثاني – نمط وزاري",
      href: term2Url,
    },
    {
      label: "بنك أسئلة تاريخ الأردن توجيهي 2009 حسب النمط الوزاري المعتمد",
      href: term1Url,
    },
    {
      label: "أسئلة تفاعلية تاريخ الأردن توجيهي 2009 حسب المنهاج المعتمد",
      href: term2Url,
    },
  ];

  // ✅ إحصائيات بسيطة (محتوى ثابت)
  const stats = [
    { label: "محتوى مهيأ للجوال", value: "✅" },
    { label: "نمط وزاري", value: "✅" },
    { label: "وزاري تفاعلي", value: "✅" },
    { label: "حسب المنهاج المعتمد", value: "✅" },
  ];

  // ✅ FAQ (محتوى + Schema) لرفع CTR
  const faqs = [
    {
      q: "هل بنك الأسئلة حسب النمط الوزاري؟",
      a: "نعم، الأسئلة مرتبة ومصممة لتكون قريبة من النمط الوزاري المعتمد لتوجيهي الأردن.",
    },
    {
      q: "هل الأسئلة حسب المنهاج المعتمد؟",
      a: "نعم، المحتوى مبني على المنهاج الرسمي ومقسّم حسب الوحدات والدروس.",
    },

    {
      q: "هل تعتبر منصة GhostExams بديل مناسب لطلاب التوجيهي 2009 الذين يستخدمون منصات اخرى في جو ؟",
      a: "نعم، أكيد تعتبر منصة GhostExams بديل قوي لاي مستخدم منصات اخرى في جو.",
    },

    {
      q: "هل الموقع وزاري تفاعلي؟",
      a: "نعم، الحل يتم بطريقة تفاعلية على شكل امتحان إلكتروني على الموبايل والكمبيوتر.",
    },
    {
      q: "شو الفرق بين بنك أسئلة وامتحانات؟",
      a: "بنك الأسئلة يعطيك تدريب واسع حسب الدروس، بينما الامتحانات تجمع الأسئلة بنمط وزاري لمحاكاة الامتحان الحقيقي.",
    },
    {
      q: "كيف أتقن التواريخ والمعاهدات بسرعة؟",
      a: "حل نماذج وزارية قصيرة بشكل يومي وراجع الأخطاء، وخلي تركيزك على التسلسل الزمني والأسباب والنتائج.",
    },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "توجيهي 2009",
        item: `${siteUrl}${tawjihi2009Hub}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "تاريخ الأردن",
        item: canonicalUrl,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "امتحانات تاريخ الأردن توجيهي 2009",
    url: canonicalUrl,
    inLanguage: "ar-JO",
    description,
    isPartOf: { "@type": "WebSite", name: "GhostExams", url: siteUrl },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "فصول تاريخ الأردن - توجيهي 2009",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الفصل الأول - تاريخ الأردن توجيهي 2009",
        url: `${siteUrl}${term1Url}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "الفصل الثاني - تاريخ الأردن توجيهي 2009",
        url: `${siteUrl}${term2Url}`,
      },
    ],
  };

  // ✅ FAQ Schema (JSON-LD)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1)
      return router.back();
    router.push(tawjihi2009Hub);
  };

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

        <meta property="og:type" content="website" />
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
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

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/20 hover:border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-300 transition w-full sm:w-auto justify-center"
            aria-label="الرجوع"
          >
            <span className="text-base">→</span>
            رجوع
          </button>

          <Link
            href={tawjihi2009Hub}
            className="text-xs sm:text-sm text-gray-300 hover:text-yellow-300 transition w-full sm:w-auto text-center sm:text-left"
          >
            توجيهي 2009 / تاريخ الأردن
          </Link>
        </div>

        {/* ✅ Breadcrumbs مرئية لرفع الربط الداخلي */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-xs sm:text-sm text-gray-300"
        >
          <ol className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <li>
              <Link
                href={tawjihi2009Hub}
                className="hover:text-yellow-300 transition"
              >
                الرئيسية
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link
                href="/tawjihi-2009"
                className="hover:text-yellow-300 transition"
              >
                توجيهي 2009
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-yellow-300 font-bold">تاريخ الأردن</li>
          </ol>
        </nav>

        <header className="text-center px-1 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-400 leading-snug sm:leading-tight">
            امتحانات تاريخ الأردن توجيهي 2009
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-4xl mx-auto leading-7 sm:leading-relaxed text-center whitespace-pre-line">
            {introText}
          </p>

          {/* ✅ Targeted SEO sentence */}
          <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-4xl mx-auto leading-7 sm:leading-relaxed text-center">
            {seoIntroShort}
          </p>

          <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-7 sm:leading-relaxed text-center">
            اختر الفصل للمتابعة واستعراض الامتحانات حسب الوحدة.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
          <Link
            href={term1Url}
            className="group bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/15 hover:border-yellow-500/40 rounded-2xl p-5 sm:p-6 transition shadow-lg min-h-[180px] flex flex-col"
            aria-label="الانتقال إلى امتحانات الفصل الأول تاريخ الأردن توجيهي 2009"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300">
                الفصل الأول
              </h2>
              <span className="text-yellow-400 group-hover:translate-x-1 transition text-lg">
                ←
              </span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed flex-1">
              امتحانات + بنك أسئلة تاريخ الأردن توجيهي 2009 للفصل الأول، مرتبة
              حسب الوحدة.
            </p>

            <div className="mt-4">
              <span className="inline-flex w-full justify-center rounded-xl bg-yellow-500 group-hover:bg-yellow-600 text-black font-bold py-3">
                عرض امتحانات الفصل الأول
              </span>
            </div>
          </Link>

          <Link
            href={term2Url}
            className="group bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/15 hover:border-yellow-500/40 rounded-2xl p-5 sm:p-6 transition shadow-lg min-h-[180px] flex flex-col"
            aria-label="الانتقال إلى امتحانات الفصل الثاني تاريخ الأردن توجيهي 2009"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300">
                الفصل الثاني
              </h2>
              <span className="text-yellow-400 group-hover:translate-x-1 transition text-lg">
                ←
              </span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed flex-1">
              امتحانات + بنك أسئلة تاريخ الأردن توجيهي 2009 للفصل الثاني، مرتبة
              حسب الوحدة.
            </p>

            <div className="mt-4">
              <span className="inline-flex w-full justify-center rounded-xl bg-yellow-500 group-hover:bg-yellow-600 text-black font-bold py-3">
                عرض امتحانات الفصل الثاني
              </span>
            </div>
          </Link>
        </section>

        {/* ✅ SEO Sections */}
        <section className="mt-10 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300">
            بنك أسئلة تاريخ الأردن توجيهي 2009 حسب النمط الوزاري
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-7 sm:leading-relaxed">
            هذه الصفحة تجمع لك بنوك أسئلة وامتحانات تاريخ الأردن لتوجيهي 2009
            بأسلوب وزاري تفاعلي قريب من النمط الوزاري المعتمد، مع أسئلة تفاعلية
            مرتبة حسب المنهاج المعتمد لتثبيت الأحداث والتواريخ والمعاهدات وفهم
            الأسباب والنتائج بسرعة وبدون تشتت.
          </p>

          <h3 className="mt-5 text-base sm:text-lg font-extrabold text-yellow-300">
            ماذا ستجد هنا؟
          </h3>

          <ul className="mt-3 text-sm sm:text-base text-gray-200 leading-7 sm:leading-relaxed space-y-2">
            <li>• امتحانات إلكترونية تفاعلية لتاريخ الأردن توجيهي 2009.</li>
            <li>• بنك أسئلة / بنوك أسئلة مصنفة حسب الفصول والوحدات.</li>
            <li>• تدريب قريب من النمط الوزاري المعتمد وبأسلوب وزاري تفاعلي.</li>
            <li>• محتوى مناسب للموبايل والكمبيوتر لسهولة الحل والمراجعة.</li>
          </ul>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4 text-gray-200"
              >
                <div className="text-xs text-gray-400">{s.label}</div>
                <div className="mt-2 text-lg font-extrabold text-yellow-300">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ Quick Links */}
        <section className="mt-10">
          <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300 text-center sm:text-right">
            روابط سريعة يبحث عنها الطلاب
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/10 hover:border-yellow-500/30 rounded-xl p-4 transition"
                aria-label={l.label}
              >
                <div className="text-sm sm:text-base text-gray-200 font-bold leading-relaxed">
                  {l.label}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  اضغط للانتقال مباشرة
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ✅ FAQ */}
        <section className="mt-10 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300">
            أسئلة شائعة عن بنك أسئلة تاريخ الأردن توجيهي 2009
          </h2>

          <div className="mt-4 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4"
              >
                <summary className="cursor-pointer text-sm sm:text-base font-bold text-gray-100 leading-relaxed">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm sm:text-base text-gray-200 leading-7 sm:leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ✅ Pillar links */}
        <section className="mt-10 text-center">
          <p className="text-sm sm:text-base text-gray-200">
            ابدأ الآن من صفحات الركائز:
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={term1Url}
              className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6"
            >
              تاريخ الأردن فصل أول – وزاري تفاعلي
            </Link>
            <Link
              href={term2Url}
              className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-gray-800 hover:bg-gray-700 border border-yellow-500/20 text-yellow-300 font-bold py-3 px-6"
            >
              تاريخ الأردن فصل ثاني – نمط وزاري
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
