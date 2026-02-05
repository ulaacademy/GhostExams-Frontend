import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <body>
        <div id="__app">
          <Main />
        </div>
        <NextScript />
      </body>
    </Html>
  );
}
