import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ar">
      <Head>
        {/* ✅ Primary favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* ✅ PNG favicons (good for Google/modern browsers) */}
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />

        {/* ✅ Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* ✅ PWA manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* ✅ Optional: theme color for mobile address bar */}
        <meta name="theme-color" content="#111827" />
      </Head>

      <body>
        <div id="__app">
          <Main />
        </div>
        <NextScript />
      </body>
    </Html>
  );
}
