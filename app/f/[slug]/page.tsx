/**
 * Public Form Builder page: /f/<slug>. No login needed (not in the proxy
 * matcher). `?embed=1` drops the site chrome for use inside an <iframe> —
 * next.config.ts lets only this route be framed.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicForm } from "@/lib/actions/forms";
import { getInstitute } from "@/lib/institute";
import { PublicForm } from "./PublicForm";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const form = await getPublicForm((await params).slug);
  return { title: form ? form.title : "Form not found", robots: { index: false } };
}

export default async function PublicFormPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const form = await getPublicForm(slug);
  if (!form) notFound();
  const embed = query.embed === "1";
  const institute = await getInstitute();

  if (embed) {
    return (
      <main className="p-3 sm:p-4">
        <PublicForm form={form} instituteName={institute.name} />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white">
            {institute.name.charAt(0) || "A"}
          </span>
          <span className="font-semibold text-white">{institute.name}</span>
        </div>
      </header>
      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <PublicForm form={form} instituteName={institute.name} />
        </div>
      </main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">
        {institute.supportPhone || institute.supportEmail ? (
          <p className="mb-1">Questions? {[institute.supportPhone, institute.supportEmail].filter(Boolean).join(" · ")}</p>
        ) : null}
        <p>
          Powered by <Link href="/" className="text-slate-400 hover:text-white">AuraEdu</Link>
        </p>
      </footer>
    </div>
  );
}
