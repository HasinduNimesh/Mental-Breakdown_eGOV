import type { AppProps } from "next/app";
import "../styles/globals.css";   // imports Tailwind setup
import { UserProvider } from "../context/UserContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}