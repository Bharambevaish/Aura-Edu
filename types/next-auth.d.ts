/**
 * Auth.js (NextAuth v5) type augmentation.
 *
 * The default Session/User/JWT types only carry `name/email/image`. We store
 * `id` and `role` in the JWT (see auth.ts callbacks), so we pin them here so
 * `session.user.role` / `token.id` type-checks everywhere in the app.
 * `import type` is erased at compile time, so pointing at the mongoose-backed
 * Role type is fine even inside edge (proxy.ts) code.
 */
import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      /** Revocation key for this sign-in (see lib/models/Session). */
      sessionId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    sessionId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    sessionId?: string;
  }
}