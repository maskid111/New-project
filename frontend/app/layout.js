import "./globals.css";
import { Inter } from "next/font/google";
import ThemeAudioControls from "../components/ThemeAudioControls";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ParrotPass Dashboard",
  description: "NFT-gated ParrotPass dashboard on Monad"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-surface text-slate-900 antialiased dark:text-slate-100`}>
        <ThemeAudioControls />
        {children}
      </body>
    </html>
  );
}
