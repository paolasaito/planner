import { Quicksand, Righteous } from "next/font/google";
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
  return (
    <div className={`${quicksand.className} ${righteous.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
