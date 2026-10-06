/**
 * server/api/auth/[...].ts
 * ────────────────────────
 * Handler de @sidebase/nuxt-auth con Auth.js (NextAuth v4).
 * Expone /api/auth/signin, /api/auth/signout, /api/auth/session, etc.
 *
 * Proveedor: Credentials (email + password con hash bcrypt).
 * El adapter de Prisma persiste las sesiones en Postgres si se usa
 * JWT + sesiones de base de datos, pero aquí usamos JWT puro por
 * simplicidad en serverless (sin adapter).
 */

import CredentialsProvider from "next-auth/providers/credentials";
import { NuxtAuthHandler } from "#auth";
import { prisma } from "../../utils/prisma";
import bcrypt from "bcryptjs";

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 días
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    // @ts-expect-error — default export required for CommonJS interop
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials: { email: string; password: string } | undefined) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña requeridos");
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!usuario || !usuario.passwordHash) {
          throw new Error("Credenciales inválidas");
        }

        const passwordOk = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );

        if (!passwordOk) {
          throw new Error("Credenciales inválidas");
        }

        // El objeto devuelto se guarda en el JWT y en la sesión del cliente.
        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
        };
      },
    }),
  ],

  callbacks: {
    // Añadir el id del usuario al JWT para que esté disponible en sesión.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});
