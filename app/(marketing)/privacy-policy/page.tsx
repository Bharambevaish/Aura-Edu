import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — AuraEdu",
  description: "What AuraEdu stores about students, staff and applicants, why, and who can see it.",
};

const sections: { title: string; body: string[] }[] = [
  {
    title: "What we store",
    body: [
      "Accounts: name, email, role, a bcrypt hash of the password (never the password itself) and sign-in security data such as failed attempts and lockouts.",
      "Student records: profile and guardian contact details, batch and course, attendance, test attempts and results, assignment submissions, lesson progress and fee invoices and payments.",
      "Admission applications: the details submitted through the Online Admission form, plus notes added by the admissions team while following up.",
      "Sign-in sessions: browser, operating system, device type, IP address and timestamps for each sign-in, so administrators can see active devices and sign them out.",
    ],
  },
  {
    title: "Why we use it",
    body: [
      "To run admissions, classes, tests, attendance, certificates and fee collection for the institute.",
      "To keep accounts secure: rate-limiting sign-in attempts, letting administrators block accounts and end sessions immediately, and recording an audit trail of financial and admission actions.",
    ],
  },
  {
    title: "Who can see it",
    body: [
      "Students see only their own records.",
      "Staff see academic and front-desk data for running classes and admissions.",
      "Administrators additionally see settings, login sessions, expense approvals and the audit trail.",
      "We do not sell personal data or share it with advertisers.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "Students can update their own contact details and password from Profile & Security.",
      "To correct other details, or to ask for your data or its deletion, contact the institute office.",
    ],
  },
  {
    title: "About this deployment",
    body: [
      "This is a product demonstration. Accounts and records here are sample data and are reset regularly — please do not enter real personal information.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#070B14] text-slate-300 px-4 py-16">
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            ← Back to AuraEdu
          </Link>
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm text-slate-400">
            How AuraEdu handles information about students, staff and applicants.
          </p>
        </header>

        {sections.map((s) => (
          <section key={s.title} className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{s.title}</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              {s.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </article>
    </main>
  );
}
