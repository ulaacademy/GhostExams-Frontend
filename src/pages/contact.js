"use client";

import Head from "next/head";
import Navbar from "@/components/Navbar";

export default function ContactPage() {
  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/contact`;

  // ✅ OG Image (اختياري)
  // ضع الصورة هنا: frontend/public/og/contact.jpg
  const ogImage = `${siteUrl}/og/contact.jpg`;

  const seoTitle = "تواصل معنا | GhostExams";
  const seoDescription =
    "للتواصل والدعم في GhostExams: واتساب فقط على الرقم 0791515106.";

  // ✅ JSON-LD
  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
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
      </Head>

      <Navbar />

      <main dir="rtl" className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400 text-center">
            تواصل معنا
          </h1>

          <p className="mt-4 text-center text-gray-300">
            التواصل والدعم عبر واتساب فقط:
          </p>

          <div className="mt-8 bg-gray-800/70 border border-yellow-500/15 rounded-2xl p-6 text-center shadow-lg">
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              0791515106
            </div>

            <p className="mt-3 text-sm text-gray-300">
              اضغط الزر بالأسفل لفتح واتساب مباشرة.
            </p>

            <a
              href="https://wa.me/962791515106"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center w-full sm:w-auto bg-green-500 hover:bg-green-600 text-black font-extrabold py-3 px-8 rounded-xl transition"
            >
              تواصل واتساب الآن
            </a>

            <p className="mt-4 text-xs text-gray-400">
              ملاحظة: إذا كان الرقم لا يفتح واتساب، انسخه والصقه داخل واتساب.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
