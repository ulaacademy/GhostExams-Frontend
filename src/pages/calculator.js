import Head from "next/head";
import Navbar from "@/components/Navbar";
import GpaCalculatorPage from "@/components/GpaCalculator/GpaCalculatorPage";

export default function CalculatorPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/calculator`;

  const title = "حساب معدل التوجيهي 30/70 الأردن | حاسبة المعدل - GhostExams";

  const description =
    "احسب معدل التوجيهي 30/70 في الأردن بسرعة وبدقة. شرح طريقة حساب المعدل التوجيهي (علمي/أدبي) + أسئلة شائعة مثل: كيف يتم حساب معدل التوجيهي وحساب معدل التوجيهي الأردن.";

  const keywords =
    "حساب معدل التوجيهي, حاسبة معدل التوجيهي, حساب معدل التوجيهي الأردن, طريقة حساب المعدل التوجيهي, طريقة حساب معدل التوجيهي, كيف يتم حساب معدل التوجيهي, حساب معدل التوجيهي العلمي";

  // ✅ FAQ Schema (يساعدك تظهر في نتائج Google كـ FAQ)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "كيف يتم حساب معدل التوجيهي 30/70 في الأردن؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "يتم حساب معدل التوجيهي 30/70 عبر إدخال علامات الحادي عشر والثاني عشر، ثم تطبيق النسبة المعتمدة (30% للحادي عشر و70% للثاني عشر) لإظهار المعدل النهائي.",
        },
      },
      {
        "@type": "Question",
        name: "هل تختلف طريقة حساب المعدل التوجيهي بين العلمي والأدبي؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "المعادلة الأساسية لحساب معدل التوجيهي 30/70 ثابتة، لكن اختلاف المواد لا يغيّر آلية الحساب نفسها. أدخل علامات المواد المطلوبة وستظهر النتيجة مباشرة.",
        },
      },
      {
        "@type": "Question",
        name: "هل هذه حاسبة معدل التوجيهي خاصة بالأردن؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "نعم، هذه الحاسبة مبنية لتناسب حساب معدل التوجيهي الأردن وفق نظام 30/70، وتعرض النتيجة بشكل واضح وفوري.",
        },
      },
      {
        "@type": "Question",
        name: "لماذا أحتاج حاسبة بدل الحساب اليدوي؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "لأن الحاسبة تقلل الأخطاء وتوفر وقتك: تدخل العلامات مرة واحدة وتحصل على المعدل النهائي مباشرة مع شرح مختصر لطريقة الحساب.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />

        {/* ✅ Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Canonical مهم جدًا */}
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Open Graph (للمشاركة) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="GhostExams" />

        {/* ✅ Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

        {/* ✅ FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <div className="min-h-screen bg-black text-yellow-400">
        {/* ✅ خلي الـNavbar LTR حتى ما ينقلب */}
        <div dir="ltr">
          <Navbar />
        </div>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          {/* ✅ صندوق الحاسبة فقط RTL + تصميم متناسق مع هوية الموقع */}
          <section
            dir="rtl"
            className="rounded-3xl border border-yellow-500/20 bg-zinc-950/60 shadow-lg backdrop-blur p-4 md:p-8"
          >
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-300">
                حاسبة معدل التوجيهي 30/70
              </h1>
              <p className="text-sm md:text-base text-yellow-200/70 mt-2">
                احسب الآن <strong>حساب معدل التوجيهي</strong> بسهولة: أدخل
                علامات الحادي عشر والثاني عشر لتحصل على نتيجتك فورًا حسب نظام{" "}
                <strong>حساب معدل التوجيهي الأردن</strong>.
              </p>
            </div>

            <GpaCalculatorPage />

            {/* ✅ SEO Content Block (مهم جدًا بدون حشو) */}
            <div className="mt-10 border-t border-yellow-500/10 pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-yellow-300">
                طريقة حساب المعدل التوجيهي 30/70
              </h2>
              <p className="text-sm md:text-base text-yellow-200/70 mt-2 leading-relaxed">
                إذا كنت تسأل: <strong>كيف يتم حساب معدل التوجيهي</strong>؟ فهذه
                الحاسبة تساعدك على تطبيق نظام 30/70 بسرعة، سواء كنت{" "}
                <strong>حساب معدل التوجيهي العلمي</strong> أو الأدبي. أدخل
                العلامات وستظهر النتيجة مباشرة بدون تعقيد.
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-yellow-500/10 bg-black/30 p-4">
                  <div className="font-bold text-yellow-200">
                    1) أدخل العلامات
                  </div>
                  <div className="text-sm text-yellow-200/70 mt-1">
                    علامات الحادي عشر + علامات الثاني عشر.
                  </div>
                </div>
                <div className="rounded-2xl border border-yellow-500/10 bg-black/30 p-4">
                  <div className="font-bold text-yellow-200">
                    2) النظام 30/70
                  </div>
                  <div className="text-sm text-yellow-200/70 mt-1">
                    تطبيق نسبة 30% و70% لإظهار المعدل النهائي.
                  </div>
                </div>
                <div className="rounded-2xl border border-yellow-500/10 bg-black/30 p-4">
                  <div className="font-bold text-yellow-200">
                    3) النتيجة فورًا
                  </div>
                  <div className="text-sm text-yellow-200/70 mt-1">
                    نتيجة واضحة + بدون أخطاء الحساب اليدوي.
                  </div>
                </div>
              </div>

              {/* ✅ FAQ UI (يطابق الـSchema فوق) */}
              <div className="mt-8">
                <h3 className="text-lg md:text-xl font-bold text-yellow-300">
                  أسئلة شائعة
                </h3>

                <div className="mt-3 space-y-3">
                  <details className="rounded-2xl border border-yellow-500/10 bg-black/30 p-4">
                    <summary className="cursor-pointer font-semibold text-yellow-200">
                      كيف يتم حساب معدل التوجيهي 30/70 في الأردن؟
                    </summary>
                    <p className="mt-2 text-sm text-yellow-200/70 leading-relaxed">
                      تدخل علامات الحادي عشر والثاني عشر، والصفحة تطبق نسبة 30%
                      و70% تلقائيًا وتظهر المعدل النهائي.
                    </p>
                  </details>

                  <details className="rounded-2xl border border-yellow-500/10 bg-black/30 p-4">
                    <summary className="cursor-pointer font-semibold text-yellow-200">
                      هل تختلف طريقة حساب المعدل التوجيهي بين العلمي والأدبي؟
                    </summary>
                    <p className="mt-2 text-sm text-yellow-200/70 leading-relaxed">
                      المعادلة الأساسية ثابتة، اختلاف المواد لا يغيّر آلية
                      الحساب نفسها.
                    </p>
                  </details>

                  <details className="rounded-2xl border border-yellow-500/10 bg-black/30 p-4">
                    <summary className="cursor-pointer font-semibold text-yellow-200">
                      هل هذه حاسبة معدل التوجيهي خاصة بالأردن؟
                    </summary>
                    <p className="mt-2 text-sm text-yellow-200/70 leading-relaxed">
                      نعم، الصفحة تستهدف حساب معدل التوجيهي الأردن بنظام 30/70.
                    </p>
                  </details>

                  <details className="rounded-2xl border border-yellow-500/10 bg-black/30 p-4">
                    <summary className="cursor-pointer font-semibold text-yellow-200">
                      لماذا أستخدم الحاسبة بدل الحساب اليدوي؟
                    </summary>
                    <p className="mt-2 text-sm text-yellow-200/70 leading-relaxed">
                      لأنها تقلل الأخطاء وتعرض النتيجة فورًا وتوفر عليك الوقت.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
