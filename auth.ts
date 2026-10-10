import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import type { Role } from "@/lib/models/User";

/**
 * Auth.js (NextAuth v5 beta) — the single authentication layer for the whole
 * app. Credentials (email + password) against the Mongo `users` collection.
 *
 * Why JWT sessions: stateless sessions that survive serverless restarts, no
 * session table to keep warm, role + id ride along in the signed token.
 *
 * Security notes kept here on purpose:
 *  - Passwords are verified with bcrypt only (cost 12, embedded in the hash).
 *  - For unknown emails we still run bcrypt against a fixed dummy hash so the
 *    response time matches a real (wrong-password) attempt — this kills
 *    user-enumeration over timing.
 *  - All errors are generic ("invalid email or password"); no user info leaks.
 *  - Relentless brute-force defense lives in lib/rate-limit.ts and is enforced
 *    in the `login` server action (lib/actions/auth.ts).
 */

/**
 * Fixed bcrypt hash (cost 12) verified for identities that do not exist, purely
 * to equalize response timing. The real password inside never matches anything.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$12$JdSZ6dXZRoxu50UZg9xhfOi08bkZ5.xqHk7OEitfztExpB2attNtO";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    // 7-day session. Role changes are picked up on next sign-in because
    // credibility re-checks happen against the DB on every server action.
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  // Allows Auth.js to work behind any host (Vercel preview deployments etc.).
  // AUTH_URL env is also set; see .env.example for the trustworthy-host setup.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        // Fail fast on empty input (nothing to verify).
        if (!email || !password) return null;

        await connectDB();
        const user = await UserModel.findOne({ email }).lean();

        if (!user) {
          // Constant-time against REAL users: still spend the same bcrypt work
          // on a dummy hash so attackers cannot distinguish "exists + wrong
          // password" from "does not exist".
          await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Admin-blocked accounts (Student Logins → Block) cannot sign in.
        if (user.isBlocked) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    // Copy the provider result into the JWT once at sign-in (not on every
    // refresh) so the token is small and stays signed-unmodified.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    // Surface the JWT fields to the session given to the app (Session.user.id/
    // user.role are typed in types/next-auth.d.ts).
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.role = (token.role as Role) ?? "student";
      }
      return session;
    },
  },
});