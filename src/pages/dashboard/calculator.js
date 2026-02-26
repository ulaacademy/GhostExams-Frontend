"use client";

import Head from "next/head";
import DashboardNavbar from "@/components/DashboardNavbar";
import GpaCalculatorPage from "@/components/GpaCalculator/GpaCalculatorPage";
import { useAuth } from "@/context/AuthContext";

export default function DashboardCalculatorPage() {
  const { user } = useAuth();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ghostexams.com";
  const canonicalUrl = `${siteUrl}/dashboard/calculator`;

  const title = "حاسبة معدل التوجيهي 30/70 | داخل لوحة الطالب - GhostExams";
  const description =
    "حاسبة معدل التوجيهي 30/70 داخل لوحة الطالب: أدخل علامات الحادي عشر والثاني عشر واحصل على المعدل فورًا.";
  const keywords =
    "حاسبة معدل التوجيهي, حساب معدل التوجيهي 30/70, حساب معدل التوجيهي الأردن, calculator";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <DashboardNavbar
        student={{ name: user?.name || "الطالب", email: user?.email || "" }}
      >
        <div className="bg-gray-100">
          <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <section
              dir="rtl"
              className="rounded-3xl border border-yellow-500/20 bg-zinc-950/60 shadow-lg backdrop-blur p-4 md:p-8 text-yellow-400"
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
      </DashboardNavbar>
    </>
  );
}