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

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      {/* ✅ Google Analytics (GA4) - Lazy load */}
      <Script
        strategy="lazyOnload"
        src="https://www.googletagmanager.com/gtag/js?id=G-HEQHRRFN67"
      />
      <Script id="ga4" strategy="lazyOnload">
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
          <Footer />
          {/* <SmartChatBot /> */}
        </ToastProvider>
      </AuthProvider>
    </>
  );
}
