import { Html, Head, Main, NextScript } from 'next/document';
import { i18n } from 'next-i18next';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="theme-color" content="#1E3A8A" />
  <meta name="apple-mobile-web-app-title" content="Sri Lanka Gov Services" />
  {/** Fonts are loaded via next/font in _app to avoid external CSS and CSP issues */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
