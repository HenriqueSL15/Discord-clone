"use server";

import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "../lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const session = await encrypt({ userId: user.id, expires });

    const cookieStore = await cookies();
    cookieStore.set("session", session, { expires, httpOnly: true });
  } catch (err) {
    return { error: "E-mail ou Usuário já existe" };
  }

  console.log(
    `Email: ${email}\nUsername: ${username}\nPassword: ${password}\n`
  );

  console.log(
    "TESTE CONEXÃO:",
    process.env.DATABASE_URL ? "URL encontrada! ✅" : "URL vazia! ❌"
  );

  //   redirect("/chat");
}
