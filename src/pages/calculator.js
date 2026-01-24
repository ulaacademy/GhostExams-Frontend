import Head from "next/head";
import Navbar from "@/components/Navbar";
import GpaCalculatorPage from "@/components/GpaCalculator/GpaCalculatorPage";

export default function CalculatorPage() {
  return (
    <>
      <Head>
        <title>حاسبة المعدل - GhostExams</title>
        <meta
          name="description"
          content="احسب معدلك النهائي للتوجيهي 30/70 بسرعة وبشكل واضح على GhostExams."
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
                أدخل علامات الحادي عشر والثاني عشر لتحصل على نتيجتك فورًا.
              </p>
            </div>

            <GpaCalculatorPage />
          </section>
        </main>
      </div>
    </>
  );
}
