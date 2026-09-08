import { useEffect } from "react";
import Head from "next/head";
import { Quicksand, Righteous } from "next/font/google";
import SplashScreen from "components/SplashScreen";
import "styles/globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sem service worker o app continua funcionando, só não é instalável.
    });
  }, []);

  return (
    <div className={`${quicksand.className} ${righteous.variable}`}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <SplashScreen />
      <Component {...pageProps} />
    </div>
  );
}
