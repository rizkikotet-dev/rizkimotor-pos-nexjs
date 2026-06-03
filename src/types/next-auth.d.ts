// Augment NextAuth types agar session.user punya id, username, dan role.
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      username: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}
