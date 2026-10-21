/**
 * /login — server wrapper around the client form (./LoginForm.tsx).
 *
 * DEMO_MODE is read here, on the server, at request time (`connection()`
 * keeps the page out of build-time prerendering), so one build serves both a
 * sales demo and a client institute and the switch is just a Vercel env var.
 * When it is off the demo credentials never leave the server.
 */
import { connection } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";
import { demoDataStatus } from "@/lib/demo-status";
import LoginForm, { type DemoLogin } from "./LoginForm";

const DEMO_LOGINS: DemoLogin[] = [
  { role: "student", email: "student@demo.auraedu.com", password: "Student@123", label: "Explore as Student" },
  { role: "admin", email: "admin@demo.auraedu.com", password: "Admin@123", label: "Explore as Admin" },
  { role: "staff", email: "staff@demo.auraedu.com", password: "Staff@123", label: "Explore as Staff" },
];

export default async function LoginPage() {
  await connection();
  const demo = isDemoMode();
  // An unseeded demo database rejects every login; say so instead.
  const demoDataMissing = demo && (await demoDataStatus()) === "missing";
  return <LoginForm demoLogins={demo ? DEMO_LOGINS : null} demoDataMissing={demoDataMissing} />;
}
