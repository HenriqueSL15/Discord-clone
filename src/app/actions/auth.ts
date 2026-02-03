"use server";

import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { decrypt, encrypt } from "../lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FriendshipWithUsers } from "../types/Friendship";
import { MessageWithUsers } from "../types/Message";
import UserInterface from "../types/User";
import { pusherServer } from "../lib/pusher";
import { FriendshipStatus, Message } from "@prisma/client";

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

export async function addFriend(formData: FormData) {
  const receiverUsername = formData.get("searchInput") as string;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const sessionData = await decrypt(token);
  if (!sessionData || !sessionData.userId) {
    return null;
  }

  const senderId = sessionData.userId;
  if (!senderId) {
    throw new Error("Sender Id é undefined");
  }

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
    console.log("Erro ao criar amizade", err);
  }
}

export async function login(
  formData: FormData,
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

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastOnline: new Date(),
        onlineStatus: "ONLINE",
      },
    });
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
  await updateOnlineStatus("OFFLINE");

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

export async function getOtherUserInfo(
  id: string,
): Promise<UserInterface | null> {
  const userData = await prisma.user.findUnique({
    where: {
      id,
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
            lastOnline: true,
            onlineStatus: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            lastOnline: true,
            onlineStatus: true,
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

export async function getMessagesHistory(
  receiverId: string | null,
): Promise<MessageWithUsers[] | []> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return [];
  }

  const sessionData = await decrypt(token);
  if (!sessionData || !sessionData.userId) {
    return [];
  }

  const senderId = sessionData.userId;

  if (!senderId) {
    throw new Error("Sender Id é undefined");
  }

  if (!receiverId) {
    throw new Error("Receiver Id é null");
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: senderId,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
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
      orderBy: { createdAt: "asc" },
    });

    return messages;
  } catch (err) {
    console.log("Erro ao buscar o histórico das mensagens", err);
  }
  return [];
}

export async function sendMessage(
  senderId: string | undefined,
  receiverId: string,
  message: string,
  friendshipId: string,
) {
  if (!senderId) {
    throw new Error("Id do sender é undefined");
  }
  try {
    const createdMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        message,
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

    if (createdMessage) {
      await pusherServer.trigger(
        `${friendshipId}`,
        "new-message",
        createdMessage,
      );
    }

    return createdMessage;
  } catch (err) {
    console.log("Erro ao criar mensagem", err);
  }
}

export async function changeFriendshipStatus(
  val: FriendshipStatus | "DELETE",
  friendshipId: string,
): Promise<FriendshipWithUsers | undefined> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      throw new Error("Token não encontrado");
    }

    const sessionData = await decrypt(token);
    if (!sessionData) {
      throw new Error("Sessão não encontrada");
    }

    const userId = sessionData.userId;

    const friendship = await prisma.friendship.findUnique({
      where: {
        id: friendshipId,
      },
    });

    if (!friendship) {
      throw new Error("Amizade não encontrada");
    }

    if (friendship.senderId != userId && friendship.receiverId != userId) {
      throw new Error("Você não faz parte dessa amizade");
    }

    if (val == "DELETE") {
      const deletedFriendship = await prisma.friendship.delete({
        where: {
          id: friendshipId,
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              username: true,
              createdAt: true,
              onlineStatus: true,
              lastOnline: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
              username: true,
              createdAt: true,
              onlineStatus: true,
              lastOnline: true,
            },
          },
        },
      });

      return deletedFriendship;
    }

    const validOptions = ["ACCEPTED", "BLOCKED", "PENDING"];

    if (!validOptions.includes(val)) {
      throw new Error();
    }

    const updatedFriendship = await prisma.friendship.update({
      where: {
        id: friendshipId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            onlineStatus: true,
            lastOnline: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            onlineStatus: true,
            lastOnline: true,
          },
        },
      },
      data: {
        status: val,
      },
    });

    return updatedFriendship;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export async function updateOnlineStatus(
  status: "ONLINE" | "ABSENT" | "OFFLINE",
): Promise<UserInterface | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const sessionData = await decrypt(token);
  if (!sessionData || !sessionData.userId) {
    return null;
  }
  const userId = sessionData.userId;

  return _updateUserStatus(userId, status);
}

export async function _updateUserStatus(
  userId: string,
  status: "ONLINE" | "ABSENT" | "OFFLINE",
): Promise<UserInterface | null> {
  try {
    let user;
    if (status === "ONLINE" || status === "OFFLINE") {
      user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          onlineStatus: status,
          lastOnline: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          onlineStatus: status,
        },
      });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const notifications = friendships.map((f) => {
      const targetId = f.receiverId == userId ? f.senderId : f.receiverId;
      return pusherServer.trigger(
        `private-user-${targetId}`,
        "friend-status-changed",
        {
          userId,
          status,
        },
      );
    });

    await pusherServer.trigger(`private-user-${userId}`, "own-status-changed", {
      status,
    });

    await Promise.all(notifications);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err) {
    console.log("ERRO AO ATUALIZAR STATUS DE USUÁRIO", err);
    return null;
  }
}

export async function updateMessage(
  messageId: string,
  newMessage: string,
): Promise<MessageWithUsers | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    console.error("Token não encontrado");
    return null;
  }

  const sessionData = await decrypt(token);
  if (!sessionData?.userId) {
    console.error("Sessão ou ID de usuário não encontrado");
    return null;
  }
  const userId = sessionData.userId;

  try {
    const message = await prisma.message.update({
      where: {
        id: messageId,
        senderId: userId,
      },
      data: {
        message: newMessage,
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

    return message;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function deleteMessage(
  messageId: string,
): Promise<Message | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    console.error("Token não encontrado");
    return null;
  }

  const sessionData = await decrypt(token);

  if (!sessionData?.userId) {
    console.error("Sessão ou ID de usuário não encontrado");
    return null;
  }
  const userId = sessionData.userId;

  try {
    const message = await prisma.message.delete({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    return message;
  } catch (err) {
    console.log(err);
    return null;
  }
}
