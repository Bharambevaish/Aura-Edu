import { requireRole } from "@/lib/dal";
import PrintClient from "./PrintClient";
import { isCertificateTemplate } from "@/lib/certificates";

export const dynamic = "force-dynamic";

const BORDER_COLOR = {
  premium_classic: "#92400e",
  modern_clean: "#94a3b8",
  elegant_gold: "#ca8a04",
} as const;

function clean(value: string | string[] | undefined, max = 120): string {
  if (Array.isArray(value)) value = value[0];
  if (typeof value !== "string") return "";
  return value.slice(0, max).replace(/[\u0000-\u001f\u007f]/g, "");
}

export default async function RenderCertificatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  await requireRole(["student", "admin", "staff"]);

  const studentName = clean(p.student) || "Student Name";
  const course = clean(p.course) || "Course Name";
  const batch = clean(p.batch, 80);
  const date = clean(p.date, 60) || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const credential = clean(p.credential, 40);
  const requestedTemplate = clean(p.template, 30);
  const template = isCertificateTemplate(requestedTemplate) ? requestedTemplate : "modern_clean";

  const border = BORDER_COLOR[template];

  return (
    <>
      {/* Scoped print overrides — hides the toolbar and paints the page white for real printing. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; }
              #print-toolbar { display: none !important; }
              #cert-sheet { box-shadow: none !important; margin: 0 !important; }
            }
          `,
        }}
      />

      {/* Control bar (hidden in print) */}
      <div
        id="print-toolbar"
        className="flex flex-wrap items-center justify-between gap-4 p-6 max-w-5xl mx-auto mt-4 mb-6 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm"
      >
        <div>
          <p className="text-sm font-bold text-white">Official Course Certificate</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {studentName} · {course}
            {batch ? ` · ${batch}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PrintClient />
        </div>
      </div>

      {/* Certificate sheet */}
      <div className="min-h-screen bg-slate-200/80 print:bg-white flex justify-center pb-20 pt-2">
        <div
          id="cert-sheet"
          className="bg-white shadow-2xl"
          style={{
            width: "794px",
            minHeight: "1123px",
            padding: "96px 80px 72px",
            position: "relative",
            overflow: "hidden",
            border: `3px solid ${border}`,
            borderRadius: "2px",
          }}
        >
          {/* Institutional header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#5E9A2E1A", border: "1px solid #5E9A2E33" }}
            >
              <span className="text-xs font-bold" style={{ color: "#5E9A2E" }}>A</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#5E9A2E" }}>
                AuraEdu Institution of Excellence
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 mb-10">
            <div className="flex-1 h-px" style={{ backgroundColor: border, opacity: 0.25 }} />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#5E9A2E" }}>🏆</span>
            <div className="flex-1 h-px" style={{ backgroundColor: border, opacity: 0.25 }} />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">Certificate</p>
            <h1
              className="text-4xl font-black tracking-tight"
              style={{ color: "#0f172a", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              of Achievement
            </h1>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6 mb-3">This is to certify that</p>

          {/* Student name */}
          <div className="text-center mb-4">
            <p
              className="text-3xl font-black italic underline underline-offset-8 pb-1"
              style={{ color: "#5E9A2E", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {studentName}
            </p>
          </div>

          {/* Completion paragraph */}
          <div className="text-center max-w-lg mx-auto mb-10">
            <p className="text-xs leading-relaxed text-slate-600">
              has successfully completed all required modules, assessments and coursework for the programme of{" "}
              <strong className="text-slate-800">{course}</strong>
              {batch && (
                <> of batch <strong className="text-slate-800">{batch}</strong></>
              )}{" "}
              with distinction and is hereby awarded this certificate in recognition of academic achievement.
            </p>
          </div>

          {/* Footer */}
          <div className="absolute bottom-10 left-20 right-20 flex justify-between items-end">
            <div className="text-center">
              <div className="w-36 h-px bg-slate-400 mb-2 mx-auto" />
              <p className="text-[9px] text-slate-500 font-bold uppercase">Issued Date</p>
              <p className="text-[11px] font-bold text-slate-800">{date}</p>
            </div>
            <div className="w-20 h-20 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-[8px] text-slate-400 font-bold">SEAL</span>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-500 font-bold uppercase">Credential</p>
              <p className="text-[11px] font-bold" style={{ color: "#5E9A2E" }}>
                {credential || "Issued Digitally"}
              </p>
              <div className="w-36 h-px bg-slate-400 mt-2 mx-auto" />
              <p className="text-[8px] text-slate-500 mt-1">Authorised Signatory</p>
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.018]">
            <span
              className="font-black uppercase tracking-widest"
              style={{
                fontSize: "120px",
                color: "#0f172a",
                transform: "rotate(-45deg)",
                whiteSpace: "nowrap",
              }}
            >
              VERIFIED
            </span>
          </div>
        </div>
      </div>
    </>
  );
}