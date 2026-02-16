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
  } catch {
    return { notFound: true };
  }
}

export default function EnglishTerm1ExamSEO({ exam }) {
  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/tawjihi-2009/english/term-1/${exam._id}`;
  const ogImage = `${siteUrl}/og/english-2009.jpg`;

  const title = `${exam.examName} | إنجليزي توجيهي 2009 الفصل الأول - GhostExams`;
  const description = `معلومات امتحان إنجليزي توجيهي 2009 (الفصل الأول) — المدة ${exam.duration} دقيقة، عدد الأسئلة ${exam.questionsCount}. هذه صفحة معلومات فقط، وتقديم الامتحان يتم من داخل حساب الطالب بعد الاشتراك.`;

  const keywords = [
    exam.examName,
    "امتحانات انجليزي توجيهي 2009",
    "الفصل الأول انجليزي 2009",
    "بنك أسئلة انجليزي توجيهي",
    "امتحانات إلكترونية توجيهي الأردن",
    "GhostExams",
  ].join(", ");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "توجيهي 2009", item: `${siteUrl}/tawjihi-2009` },
      { "@type": "ListItem", position: 2, name: "اللغة الإنجليزية", item: `${siteUrl}/tawjihi-2009/english` },
      { "@type": "ListItem", position: 3, name: "الفصل الأول", item: `${siteUrl}/tawjihi-2009/english/term-1` },
      { "@type": "ListItem", position: 4, name: exam.examName, item: canonicalUrl },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonicalUrl,
    inLanguage: "ar-JO",
    description,
    isPartOf: { "@type": "WebSite", name: "GhostExams", url: siteUrl },
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
      </Head>

      <Navbar />

      <main className="pt-24 pb-14 px-4 max-w-4xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between gap-3 mb-5">
          <Link
            href="/tawjihi-2009/english/term-1"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/20 hover:border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-300 transition"
          >
            <span className="text-base">→</span> رجوع
          </Link>

          <div className="text-[11px] sm:text-sm text-gray-300">
            إنجليزي 2009 / الفصل الأول / معلومات الامتحان
          </div>
        </div>

        <div className="bg-gray-800/70 border border-yellow-500/15 rounded-2xl p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-400 leading-snug text-center sm:text-right">
            {exam.examName}
          </h1>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-200">
            <div className="bg-gray-900/50 rounded-xl p-4 text-sm sm:text-base">
              📚 المادة: <span className="text-yellow-300 font-bold">{exam.subject}</span>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-sm sm:text-base">
              🧪 الصف: <span className="text-yellow-300 font-bold">{exam.grade}</span>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-sm sm:text-base">
              📅 الفصل: <span className="text-yellow-300 font-bold">{exam.term || "غير محدد"}</span>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-sm sm:text-base">
              🕒 المدة: <span className="text-yellow-300 font-bold">{exam.duration}</span> دقيقة
            </div>
          </div>

          <div className="mt-3 bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4 text-sm sm:text-base text-gray-200">
            ❓ عدد الأسئلة: <span className="text-yellow-300 font-bold">{exam.questionsCount}</span>
          </div>

          {exam.teacher && (
            <div className="mt-3 bg-gray-900/40 border border-yellow-500/10 rounded-xl p-4 text-sm sm:text-base">
              👩‍🏫 المعلم: <span className="text-yellow-300 font-bold">{exam.teacher?.name}</span>
            </div>
          )}

          <Link
            href="https://wa.link/ghostexams"
            className="mt-5 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
          >
            اشترك معنا الآن 
          </Link>

          <div className="mt-5 text-xs text-blue-400 font-bold">
       هذه صفحة تقدم معلومات الامتحان  فقط — تقديم الامتحان يتم من داخل حساب الطالب بعد تفعيل الاشتراك
          لتفعيل الاشتراك اضغط على الزر تواصل معنا نساعدك
          </div>
        </div>
      </main>
    </div>
  );
}
