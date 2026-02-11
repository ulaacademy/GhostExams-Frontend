import Head from "next/head";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Tawjihi2009Arabic() {
  const router = useRouter();

  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/tawjihi-2009/arabic`;

  const title =
    "امتحانات عربي توجيهي 2009 الأردن | بنك أسئلة + فصل أول/ثاني - GhostExams";
  const description =
    "امتحانات إلكترونية وبنك أسئلة اللغة العربية لتوجيهي 2009 في الأردن. اختر الفصل (الأول/الثاني) واستعرض الامتحانات حسب الوحدة.";
  const keywords =
    "امتحانات عربي توجيهي 2009, بنك اسئلة عربي توجيهي, امتحانات الكترونية عربي, توجيهي الاردن 2009, بنك أسئلة عربي, امتحانات وزارية عربي";

  // ✅ روابط الفصول
  const term1Url = "/tawjihi-2009/arabic/term-1";
  const term2Url = "/tawjihi-2009/arabic/term-2";

  // ✅ صفحة توجيهي 2009 (Hub)
  const tawjihi2009Hub = "/";

  // ✅ OG Image (لازم تحط صورة فعلية بالموقع داخل /public)
  // مثال: public/og/arabic-2009.jpg
  const ogImage = `${siteUrl}/og/arabic-2009.jpg`;

  // ✅ نص تعريف (مجمّع) لدعم السيو — رح نضيفه تحت H1 مباشرة
  const introText = `منصة GhostExams توفر امتحانات اللغة العربية لتوجيهي الأردن 2009 بصيغة إلكترونية، مع بنك أسئلة منظم يساعد الطالب على التدريب بشكل واقعي وفعّال.
في هذه الصفحة ستجد روابط الامتحانات مرتبة حسب الفصل الأول والفصل الثاني والوحدات أيضًا، لتقدر تختار مسارك بسهولة وتراجع المادة بطريقة منظمة.
الامتحانات مصممة لتقيس فهمك وتدربك على أسلوب الأسئلة المتوقّع، وتساعدك على معرفة مستوى جاهزيتك بسرعة—خصوصًا من ناحية طريقة السؤال والخيارات وطبيعة النمط الوزاري.`;

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
        name: "اللغة العربية",
        item: canonicalUrl,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "امتحانات عربي توجيهي 2009",
    url: canonicalUrl,
    inLanguage: "ar-JO",
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "GhostExams",
      url: siteUrl,
    },
  };

  // ✅ قائمة عناصر داخل الصفحة (الفصل الأول والثاني)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "فصول اللغة العربية - توجيهي 2009",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الفصل الأول - عربي توجيهي 2009",
        url: `${siteUrl}${term1Url}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "الفصل الثاني - عربي توجيهي 2009",
        url: `${siteUrl}${term2Url}`,
      },
    ],
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(tawjihi2009Hub);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />

        {/* ✅ RTL + Language */}
        <meta httpEquiv="content-language" content="ar-JO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="language" content="Arabic" />
        <html lang="ar" />

        {/* ✅ Canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Open Graph */}
        <meta property="og:type" content="website" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      </Head>

      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto" dir="rtl">
        {/* ✅ Top bar - mobile wrap */}
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
            توجيهي 2009 / اللغة العربية
          </Link>
        </div>

        {/* ✅ Header */}
        <header className="text-center px-1 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-400 leading-snug sm:leading-tight">
            امتحانات عربي توجيهي 2009
          </h1>

          {/* ✅ SEO intro (mobile readable) */}
          <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-4xl mx-auto leading-7 sm:leading-relaxed text-center whitespace-pre-line">
            {introText}
          </p>

          {/* ✅ Short description */}
          <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-7 sm:leading-relaxed text-center">
            هنا تجد بنك أسئلة وامتحانات إلكترونية للغة العربية (توجيهي 2009)
            مرتبة حسب الفصل والوحدة. اختر الفصل للمتابعة.
          </p>
        </header>

        {/* ✅ Cards (mobile optimized) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
          <Link
            href={term1Url}
            className="group bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/15 hover:border-yellow-500/40 rounded-2xl p-5 sm:p-6 transition shadow-lg min-h-[180px] flex flex-col"
            aria-label="الانتقال إلى امتحانات الفصل الأول عربي توجيهي 2009"
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
              امتحانات + بنك أسئلة عربي توجيهي 2009 للفصل الأول، مرتبة حسب
              الوحدة.
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
            aria-label="الانتقال إلى امتحانات الفصل الثاني عربي توجيهي 2009"
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
              امتحانات + بنك أسئلة عربي توجيهي 2009 للفصل الثاني، مرتبة حسب
              الوحدة.
            </p>

            <div className="mt-4">
              <span className="inline-flex w-full justify-center rounded-xl bg-yellow-500 group-hover:bg-yellow-600 text-black font-bold py-3">
                عرض امتحانات الفصل الثاني
              </span>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
