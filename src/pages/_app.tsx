import type { AppProps } from "next/app";
import "../styles/globals.css";   // imports Tailwind setup

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
