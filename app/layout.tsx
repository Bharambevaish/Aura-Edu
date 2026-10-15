import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "AuraEdu — Institution Management Platform | Academy, School/College ERP & HRM",
  description: "Run your entire institution on one platform. From coaching academies to schools, colleges and universities — manage admissions, students, staff, attendance, examinations, fees, accounts and payroll.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Render per request so every page gets this request's CSP nonce (proxy.ts).
  await connection();
  return (
    <html lang="en" className={`${outfit.variable} scroll-smooth dark`}>
      <body className="bg-[#070B14] text-slate-100 font-sans selection:bg-[#5E9A2E]/30 selection:text-[#74B53C] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

