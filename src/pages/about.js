"use client";

import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/about`;
  const ogImage = `${siteUrl}/og/about.jpg`; // ضع الصورة داخل public/og/about.jpg

    // ✅ مهم: تعريف رابط واتساب (بدّل الرابط لاحقًا)
  const WHATSAPP_URL = "https://wa.link/ghostexams";
  
  const title =
    "من نحن | GhostExams - بنك أسئلة توجيهي الأردن 2009 وامتحانات تفاعلية";
  const description =
    "تعرف على GhostExams: منصة بنوك أسئلة وامتحانات تفاعلية لطلاب التوجيهي الأردني، مع تنظيم المواد والفصول وتجربة واضحة على الموبايل والكمبيوتر.";

  const keywords = [
    "من نحن GhostExams",
    "بنك اسئلة توجيهي الأردن",
    "بنوك اسئلة توجيهي 2009",
    "امتحانات توجيهي 2009",
    "امتحانات تفاعلية توجيهي",
    "نمط وزاري",
    "حسب المنهاج المعتمد",
    "GhostExams",
  ].join(", ");

  // ✅ Breadcrumbs (JSON-LD)
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GhostExams", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "من نحن", item: canonicalUrl },
    ],
  };

  // ✅ AboutPage (JSON-LD)
  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: title,
    url: canonicalUrl,
    inLanguage: "ar-JO",
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "GhostExams",
      url: siteUrl,
    },
  };

  // ✅ Organization (JSON-LD) — قوّي الثقة
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GhostExams",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`, // ضع اللوجو داخل public/logo.png
    sameAs: [
      // حط روابطك الحقيقية إذا موجودة
      // "https://www.facebook.com/yourpage",
      // "https://www.instagram.com/yourpage",
      // "https://www.tiktok.com/@yourpage",
    ],
  };

  // ✅ FAQ (Visible + JSON-LD)
  const faqItems = [
    {
      q: "ما هو GhostExams؟",
      a: "منصة بنوك أسئلة وامتحانات تفاعلية تستهدف طلاب التوجيهي الأردني، مع تنظيم المحتوى حسب المادة والفصل.",
    },
    {
      q: "لمن هذه المنصة مناسبة؟",
      a: "مناسبة لطلاب التوجيهي 2009 (وباقي الأجيال حسب توفر المحتوى) الذين يريدون تدريبًا منظمًا وسريعًا على المناهج الأردنية.",
    },
    {
      q: "هل المحتوى مطابق للمنهاج المعتمد؟",
      a: "نعم، يتم تنظيم المحتوى ليكون قريبًا من المنهاج الرسمي، مع تقسيم واضح حسب المواد والفصول.",
    },
    {
      q: "هل أستطيع تقديم الامتحان مباشرة من صفحات الموقع؟",
      a: "قوائم الامتحانات وصفحات المعلومات تكون للمعاينة، أما تقديم الامتحان الفعلي فيكون من داخل حساب الطالب بعد تفعيل الاشتراك.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  // ✅ روابط داخلية قوية (Internal Linking)
  const links = [
    {
      label: "بوابة توجيهي 2009",
      href: "/tawjihi-2009",
      desc: "اختيار المادة والفصل للوصول للامتحانات بسرعة",
    },
    {
      label: "عربي توجيهي 2009",
      href: "/tawjihi-2009/arabic",
      desc: "صفحة المادة + روابط الفصل الأول والثاني",
    },
    {
      label: "إنجليزي توجيهي 2009",
      href: "/tawjihi-2009/english",
      desc: "صفحة المادة + روابط الفصل الأول والثاني",
    },
    {
      label: "دين توجيهي 2009",
      href: "/tawjihi-2009/islamic",
      desc: "صفحة المادة + روابط الفصل الأول والثاني",
    },
    {
      label: "تاريخ الأردن توجيهي 2009",
      href: "/tawjihi-2009/jordan-history",
      desc: "صفحة المادة + روابط الفصل الأول والثاني",
    },
  ];

  // ✅ النص الذي زودتني به (مدمج داخل المحتوى)
  const providedText =
    "من أبرز المنصات المتخصصة لتوفير بنوك أسئلة شاملة لطلاب التوجيهي الأردني، ويعد خياراً قوياً لطلاب 2009 المقبلين على المراحل التأهيلية، حيث يركز على تقديم أسئلة منوعة (اختيار من متعدد وإجابات قصيرة) تغطي المناهج الأردنية لضمان التدريب الفعال";

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

        {/* OG */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_JO" />
        <meta property="og:site_name" content="GhostExams" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content="من نحن | GhostExams" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="من نحن | GhostExams" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Navbar />

      <main dir="rtl" className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Breadcrumbs visible */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Link href="/" className="hover:text-yellow-300 transition">
                GhostExams
              </Link>
              <span className="text-gray-500">›</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-300 font-bold">من نحن</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center sm:text-right">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-400">
            من نحن — GhostExams
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-200 leading-7 sm:leading-relaxed">
            GhostExams منصة امتحانات تفاعلية وبنوك أسئلة تستهدف طلاب التوجيهي
            الأردني، مع تنظيم المحتوى حسب المادة والفصل لتسهيل المراجعة والوصول
            السريع للمحتوى.
          </p>
        </header>

        {/* Provided text block */}
        <section className="mt-6 bg-gray-800/60 border border-yellow-500/15 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            ماذا يميز GhostExams لطلاب توجيهي 2009؟
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">
            {providedText}
          </p>
        </section>

        {/* Mission + Method */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
              رسالتنا
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">
              نساعد طالب التوجيهي يوصل لبنوك أسئلة وامتحانات منظمة بطريقة واضحة
              وسريعة، ويتمرّن على أسئلة قريبة من أسلوب الامتحان الحقيقي، سواء على
              الموبايل أو الكمبيوتر.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
              كيف نرتّب المحتوى؟
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">
              نقسم المحتوى حسب المادة والفصل (الأول/الثاني)، وبعدها نوفر قائمة
              امتحانات على شكل كروت، بحيث يقدر الطالب يعاين مدة الامتحان وعدد
              الأسئلة بسهولة قبل البدء.
            </p>
          </div>
        </section>

        {/* Internal links */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            روابط سريعة لتوجيهي 2009
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map((l, idx) => (
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

        {/* FAQ visible */}
        <section className="mt-8 bg-gray-800/50 border border-yellow-500/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-extrabold text-yellow-300">
            أسئلة شائعة
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

        {/* CTA */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
        >
          تواصل معنا على واتساب
        </a>

        <p className="mt-4 text-xs text-gray-400 text-center">
          GhostExams — منصة بنوك أسئلة وامتحانات تفاعلية لطلاب التوجيهي الأردني.
        </p>
      </main>
    </div>
  );
}