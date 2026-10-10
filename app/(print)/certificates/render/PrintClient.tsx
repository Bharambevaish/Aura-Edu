"use client";

import React, { useEffect } from "react";
import { Printer } from "lucide-react";

/**
 * Minimal client wrapper for the certificate render page.
 *
 * - A visible "Print / Save as PDF" button the user can click.
 * - Auto-fires the print dialog 600 ms after mount so the certificate is
 *   painted when a visitor hits a download entry point.
 */
export default function PrintClient() {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E9A2E] text-white font-semibold text-sm hover:bg-[#4A7E24] transition-colors shadow-lg"
    >
      <Printer size={16} />
      Print / Save as PDF
    </button>
  );
}