import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/ModalProvider";

// Body type — calm, plain, weights 400-600
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Display type — loud, uppercase headlines
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buck Me — Cash that says yes",
  description:
    "Personal loans $5,000–$75,000 over 1–7 years, rates from 6.17% p.a. No broker, no begging, no 'let me check with my manager.' Approved before you've changed your mind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
