import type { AppProps } from "next/app";
import "../styles/globals.css";   // imports Tailwind setup
import { UserProvider } from "../context/UserContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
    </ThemeProvider>
  );
}