"use server";

import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { decrypt, encrypt } from "../lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FriendshipWithUsers } from "../types/FriendshipInterface";

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

  redirect("/");
}

export async function addFriend(senderId: string, formData: FormData) {
  const receiverUsername = formData.get("searchInput") as string;

  try {
    const receiverUser = await prisma.user.findUnique({
      where: {
        username: receiverUsername,
      },
    });

    const friendship = await prisma.friendship.create({
      data: {
        receiverId: receiverUser?.id ? receiverUser.id : "",
        senderId,
      },
    });

    return friendship;
  } catch (err) {
    console.log(err);
    return { error: "Erro ao criar amizade" };
  }
}

export async function login(
  formData: FormData
): Promise<UserInterface | { error: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error();
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error();
    }

    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const session = await encrypt({ userId: user.id, expires });

    const cookieStore = await cookies();
    cookieStore.set("session", session, { expires, httpOnly: true });
  } catch (err) {
    return { error: "E-mail ou Senha errados" };
  }
  const res = await getUserInfo();
  if (!res) {
    return { error: "Não foi possível obter as informações do usuário" };
  }

  return res;
}

export async function logoff() {
  const cookieStore = await cookies();
  cookieStore.delete("session");

  redirect("/login");
}

export async function getUserInfo(): Promise<UserInterface | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const sessionData = await decrypt(token);
  if (!sessionData || !sessionData.userId) {
    return null;
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: sessionData.userId,
    },
  });

  if (!userData) return null;

  const { password, ...userWithoutPassword } = userData;

  return userWithoutPassword;
}

export async function getUserFriendships(): Promise<
  FriendshipWithUsers[] | null
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const sessionData = await decrypt(token);

  if (!sessionData || !sessionData.userId) {
    return null;
  }

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { receiverId: sessionData.userId },
          { senderId: sessionData.userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return friendships;
  } catch (err) {
    console.log("Erro ao obter as amizades do usuário");
    return null;
  }
}
