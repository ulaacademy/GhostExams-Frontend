import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import SmartChatBot from "@/components/SmartChatBot"; // ✅ أضف هذا السطر
import "@/styles/teacherExamStyles.css";
import "@/styles/booksExamStyles.css";
import "@/styles/schoolExamStyles.css";
import Head from "next/head";
import Script from "next/script";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/next.svg" />
      </Head>

      {/* Google Analytics (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-HEQHRRFN67"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-HEQHRRFN67');
        `}
      </Script>

      <AuthProvider>
        <ToastProvider>
          <Component {...pageProps} />
          <SmartChatBot /> {/* ✅ الزر العائم يظهر في كل الصفحات */}
        </ToastProvider>
      </AuthProvider>
    </>
  );
}

