/**
 * Privacy Notice — plain language, in the spirit of India's Digital Personal
 * Data Protection Act 2023. Each institute runs its own deployment, so the
 * institute name and grievance contact come from Settings → Institute Profile
 * (read per request), and the retention period and data region from
 * PRIVACY_SETTINGS in lib/privacy.ts. Bump PRIVACY_NOTICE_VERSION when the
 * substance of this page changes: it is stored with every consent.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getInstitute, DEFAULT_INSTITUTE, type InstituteProfile } from "@/lib/institute";
import { isDemoMode } from "@/lib/demo-mode";
import { PRIVACY_NOTICE_VERSION, PRIVACY_SETTINGS } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "What the institute collects about students, guardians and applicants, why, who sees it, how long it is kept and your rights.",
};

/** A value the institute has not filled in yet, shown so it can't be missed. */
function Placeholder({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-amber-400/20 px-1 text-amber-200">{children}</mark>;
}

type Section = { title: string; body: React.ReactNode[] };

function sections(inst: InstituteProfile): Section[] {
  const name = inst.name;
  const years = PRIVACY_SETTINGS.feeRecordRetentionYears;
  const region = PRIVACY_SETTINGS.dataRegion;
  return [
    {
      title: "What we collect",
      body: [
        "Applicant and student details: name, date of birth, gender, email, phone, address, course and batch, and (if you provide them) ID proof details.",
        "Parent/guardian details: name, relationship, phone and email.",
        "Academic records: attendance, test attempts and results, assignment submissions, lesson progress and certificates.",
        "Fee records: invoices, payments, refunds and waivers.",
        "Account and security data: your login email, a scrambled (hashed) version of your password — never the password itself — and, for each sign-in, the browser, device and IP address.",
        "When you give consent on a form we record that you agreed, when, the version of this notice, whether a parent/guardian agreed on a minor's behalf, and the IP address it came from.",
      ],
    },
    {
      title: "Why we use it, and on what basis",
      body: [
        `${name} uses this data only to handle your admission enquiry, run classes, tests and attendance, issue certificates, collect fees and keep accounts secure.`,
        "The legal basis is your consent, which you give on the admission or enquiry form. For a student under 18, a parent or guardian gives consent on the student's behalf.",
        "We do not sell personal data, use it for advertising, or track children's behaviour for profiling.",
      ],
    },
    {
      title: "Who can see it",
      body: [
        `Only ${name}'s own staff, and only what their job needs: front-desk and teaching staff see admission and academic data; administrators also see fees, settings and sign-in history.`,
        "Students see only their own records.",
        "The software provider and hosting company store the data on the institute's behalf and do not use it for anything else.",
      ],
    },
    {
      title: "Where it is stored",
      body: [
        <>
          In a MongoDB Atlas database used only by {name}, in the{" "}
          {region ? <strong className="text-white">{region}</strong> : <Placeholder>[region — set for this deployment]</Placeholder>} region. Connections
          are encrypted and passwords are never stored in readable form.
        </>,
      ],
    },
    {
      title: "How long we keep it",
      body: [
        "Admission enquiries that do not lead to admission: kept only while we follow up with you; ask us and we will erase them.",
        "Student records: for the duration of the course.",
        <>
          Fee and tax records (invoices, payments, receipts): for{" "}
          {years ? <strong className="text-white">{years} years</strong> : <Placeholder>[N] years</Placeholder>} after the course ends, because tax law
          requires it. If you ask us to erase your data before then, we remove your name and contact details and keep only the amounts.
        </>,
      ],
    },
    {
      title: "Your rights",
      body: [
        "Access: ask for a copy of the personal data we hold about you (or your child).",
        "Correction: ask us to fix anything wrong or out of date. Students can also update their own contact details under Profile & Security.",
        "Erasure: ask us to erase your personal data. Your name, contact, guardian and ID details are removed and your login is closed; fee amounts are kept for tax law, without your name.",
        "Withdraw consent: you can withdraw consent at any time by contacting us below. This stops further use of your data, but it does not undo what was done before, and we may not be able to continue providing classes.",
        "Nominate: you may nominate someone to exercise these rights for you in case of death or incapacity.",
        "We will respond to your request without undue delay. If you are not satisfied with our response, you may complain to the Data Protection Board of India.",
      ],
    },
  ];
}

export default async function PrivacyPolicyPage() {
  await connection();
  // The notice must render even if the database is briefly unreachable.
  const institute = await getInstitute().catch(() => DEFAULT_INSTITUTE);
  const demo = isDemoMode();

  return (
    <main className="min-h-screen bg-[#070B14] text-slate-300 px-4 py-16">
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold text-white">Privacy Notice</h1>
          <p className="text-sm text-slate-400">
            How {institute.name} handles personal data about students, parents/guardians and applicants. Version {PRIVACY_NOTICE_VERSION}.
          </p>
        </header>

        {demo && (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            This is a product demonstration. Accounts and records here are sample data and are reset regularly — please do not enter real personal
            information.
          </p>
        )}

        {sections(institute).map((s) => (
          <section key={s.title} className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{s.title}</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              {s.body.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Grievance contact</h2>
          <p className="text-sm leading-relaxed">
            To use any of these rights or raise a concern, contact {institute.legalName || institute.name}:
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              Email:{" "}
              {institute.supportEmail ? (
                <a href={`mailto:${institute.supportEmail}`} className="text-emerald-400 hover:underline">
                  {institute.supportEmail}
                </a>
              ) : (
                <Placeholder>[set in Settings → Institute Profile]</Placeholder>
              )}
            </li>
            <li>Phone: {institute.supportPhone || <Placeholder>[set in Settings → Institute Profile]</Placeholder>}</li>
            {institute.address && <li>Address: {institute.address}</li>}
          </ul>
        </section>
      </article>
    </main>
  );
}
