import { Mukta } from "next/font/google";
import "./globals.css";

const inter = Mukta({ subsets: ["latin"], weight: "700" });

export const metadata = {
  title: "ReciMaster",
  description: "ReciMaster is your AI powered Recipe Master",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
