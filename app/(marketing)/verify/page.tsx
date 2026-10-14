import type { Metadata } from "next";
import Link from "next/link";
import { verifyCertificate } from "@/lib/certificate-signing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify a certificate — AuraEdu",
  description: "Check that an AuraEdu certificate is genuine and unaltered.",
};

/**
 * Public certificate check. Every printed certificate links here with its
 * details and signature; the page confirms the signature matches, i.e. the
 * certificate was issued by AuraEdu and its details were not changed.
 */
export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { valid, fields } = verifyCertificate(await searchParams);

  return (
    <main className="min-h-screen bg-[#070B14] text-slate-300 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <Link href="/" className="text-sm text-emerald-400 hover:underline">
          ← AuraEdu
        </Link>
        {valid ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-8 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">✓ Genuine certificate</p>
            <h1 className="text-2xl font-bold text-white">{fields.student}</h1>
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <dt className="text-slate-500">Awarded for</dt>
              <dd className="col-span-2 text-white">{fields.course}</dd>
              {fields.batch && (
                <>
                  <dt className="text-slate-500">Batch</dt>
                  <dd className="col-span-2 text-white">{fields.batch}</dd>
                </>
              )}
              <dt className="text-slate-500">Issued</dt>
              <dd className="col-span-2 text-white">{fields.date}</dd>
              <dt className="text-slate-500">Credential</dt>
              <dd className="col-span-2 font-mono text-emerald-300">{fields.credential}</dd>
            </dl>
            <p className="text-xs text-slate-500">
              Issued by AuraEdu and unchanged since. If the printed certificate shows different details, it has been altered.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-8 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-400">✗ Not verified</p>
            <h1 className="text-xl font-bold text-white">This certificate could not be verified</h1>
            <p className="text-sm text-slate-400">
              The link is incomplete, was not issued by AuraEdu, or its details were changed. Use the full link printed on the
              certificate, or contact the institute.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
