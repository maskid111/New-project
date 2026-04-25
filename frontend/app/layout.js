import "./globals.css";

export const metadata = {
  title: "ParrotPass Dashboard",
  description: "NFT-gated ParrotPass dashboard on Monad"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
