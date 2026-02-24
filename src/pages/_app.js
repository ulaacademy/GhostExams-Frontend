import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
//import SmartChatBot from "@/components/SmartChatBot";
import "@/styles/teacherExamStyles.css";
import "@/styles/booksExamStyles.css";
import "@/styles/schoolExamStyles.css";
import Head from "next/head";
import Script from "next/script";
import Footer from "@/components/Footer";
import WhatsAppChat from "@/components/WhatsAppChat";
import { useEffect, useState } from "react";

const GA_ID = "G-HEQHRRFN67";

export default function App({ Component, pageProps }) {
  const [loadGA, setLoadGA] = useState(false);

  useEffect(() => {
    // ✅ حمّل GA بعد أول تفاعل من المستخدم (مفيد لـ Lighthouse)
    const onFirstInteraction = () => {
      setLoadGA(true);
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("mousedown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };

    window.addEventListener("scroll", onFirstInteraction, { passive: true });
    window.addEventListener("mousedown", onFirstInteraction);
    window.addEventListener("touchstart", onFirstInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", onFirstInteraction);

    return () => {
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("mousedown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      {/* ✅ Google Analytics (GA4) - Load AFTER first user interaction */}
      {loadGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      <AuthProvider>
        <ToastProvider>
          <Component {...pageProps} />
          <Footer />
          {/* <SmartChatBot /> */}
          <WhatsAppChat
            phone="962791515106"
            message="-مرحبا، عندي استفسار بخصوص الاشتراك 👋، (بدي الاربع مواد بسعر  7 دنانير لاني جاي من الموقع ) "
          />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}
