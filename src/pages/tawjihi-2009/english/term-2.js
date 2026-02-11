import Head from "next/head";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/services/api";

export async function getServerSideProps() {
  const subject = "english";
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

export default function EnglishTerm2({ exams, usedFallback }) {
  const router = useRouter();
 useAuth();

  const siteUrl = "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/tawjihi-2009/english/term-2`;

  const title = "امتحانات إنجليزي توجيهي 2009 | الفصل الثاني - GhostExams";
  const description =
    "قائمة امتحانات اللغة الإنجليزية (الفصل الثاني) لتوجيهي 2009 في الأردن. استعرض الامتحانات حسب الوحدة مع مدة الامتحان وعدد الأسئلة.";

  const ogImage = `${siteUrl}/og/english-term-2-2009.jpg`; // ضع صورة فعلية داخل public/og

  const introText = `هذه صفحة امتحانات اللغة الإنجليزية لتوجيهي الأردن 2009 (الفصل الثاني) على GhostExams.
ستجد هنا الامتحانات الحقيقية الموجودة بالموقع مرتبة حسب اسم الوحدة/الكتاب، مع مدة الامتحان وعدد الأسئلة.
اضغط على "عرض الامتحان" لمعاينة بيانات الامتحان  قبل الدخول للامتحان من لوحة الطالب.`;

  const keywords =
    "امتحانات انجليزي توجيهي 2009, امتحانات English توجيهي, بنك اسئلة انجليزي توجيهي 2009, امتحانات الكترونية انجليزي, توجيهي الاردن 2009 انجليزي, نمط وزاري انجليزي";

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
        name: "اللغة الإنجليزية",
        item: `${siteUrl}/tawjihi-2009/english`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "الفصل الثاني",
        item: canonicalUrl,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "امتحانات إنجليزي توجيهي 2009 - الفصل الثاني",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: exams?.length || 0,
    itemListElement: (exams || []).map((exam, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: exam.examName || `امتحان إنجليزي ${idx + 1}`,
      url: `${siteUrl}/tawjihi-2009/english/term-2/${exam._id}`,
    })),
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

        {/* OG */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_JO" />
        <meta property="og:site_name" content="GhostExams" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      </Head>

      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto" dir="rtl">
        {/* Top nav (Mobile-friendly) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/tawjihi-2009/english"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800/70 hover:bg-gray-800 border border-yellow-500/20 hover:border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-300 transition w-full sm:w-auto"
          >
            <span className="text-base">→</span> رجوع
          </Link>

          <Link
            href="/tawjihi-2009/english"
            className="text-xs sm:text-sm text-gray-300 hover:text-yellow-300 transition w-full sm:w-auto text-center sm:text-left"
          >
            إنجليزي / الفصل الثاني
          </Link>
        </div>

        <header className="text-center px-1 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-400 leading-snug sm:leading-tight">
            امتحانات إنجليزي توجيهي 2009 — الفصل الثاني
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-4xl mx-auto leading-7 sm:leading-relaxed text-center whitespace-pre-line">
            {introText}
          </p>

          <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-7 sm:leading-relaxed text-center">
            عدد الامتحانات:
            <span className="mx-2 text-yellow-300 font-extrabold">
              {exams?.length || 0}
            </span>
          </p>

          {usedFallback && (
            <div className="mt-3 text-xs sm:text-sm text-yellow-300/90">
              ✅ ملاحظة: تم عرض النتائج بدون فلتر الصف لأن قيم الصف في الداتا ليست موحدة.
            </div>
          )}
        </header>

        {!exams || exams.length === 0 ? (
          <div className="mt-8 bg-gray-800/60 border border-yellow-500/15 rounded-2xl p-6 text-gray-300 text-center">
            لا توجد امتحانات حالياً للفصل الثاني (إنجليزي).
          </div>
        ) : (
          <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exams.map((exam) => {
              const previewHref = `/tawjihi-2009/english/term-2/${exam._id}`;
              const seoCardText = `امتحان إنجليزي توجيهي 2009 (الفصل الثاني) — ${
                exam.examName || "بدون عنوان"
              }. مدة الامتحان ${exam.duration || "?"} دقيقة، وعدد الأسئلة ${
                exam.questionsCount || "?"
              }.`;

              return (
                <article
                  key={exam._id}
                  className="bg-gray-800/70 border border-yellow-500/15 hover:border-yellow-500/40 rounded-2xl p-5 sm:p-6 transition shadow-lg flex flex-col min-h-[220px]"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-yellow-300 leading-snug line-clamp-2">
                    {exam.examName}
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {seoCardText}
                  </p>

                  <div className="mt-3 text-sm text-gray-300 space-y-1">
                    <p>⏱️ المدة: {exam.duration} دقيقة</p>
                    <p>🧠 عدد الأسئلة: {exam.questionsCount}</p>
                    <p className="text-xs text-gray-400">
                      📌 الفصل: {exam.term || "غير محدد"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(previewHref)}
                    className="mt-4 inline-flex w-full justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
                    aria-label={`عرض معاينة الامتحان: ${exam.examName}`}
                  >
                    عرض الامتحان (معاينة)
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
