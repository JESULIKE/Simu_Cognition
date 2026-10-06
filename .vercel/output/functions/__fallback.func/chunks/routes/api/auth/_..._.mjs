import { b as prisma, e as useRuntimeConfig } from '../../../_/nitro.mjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { N as NuxtAuthHandler } from '../../../_/nuxtAuthHandler.mjs';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'next-auth/core';

const _____ = NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60
    // 7 días
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [
    // @ts-expect-error — default export required for CommonJS interop
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contrase\xF1a", type: "password" }
      },
      async authorize(credentials) {
        if (!(credentials == null ? void 0 : credentials.email) || !(credentials == null ? void 0 : credentials.password)) {
          throw new Error("Email y contrase\xF1a requeridos");
        }
        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email }
        });
        if (!usuario || !usuario.passwordHash) {
          throw new Error("Credenciales inv\xE1lidas");
        }
        const passwordOk = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );
        if (!passwordOk) {
          throw new Error("Credenciales inv\xE1lidas");
        }
        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre
        };
      }
    })
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
        session.user.id = token.id;
      }
      return session;
    }
  }
});

export { _____ as default };
//# sourceMappingURL=_..._.mjs.map
