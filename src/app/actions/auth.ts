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

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Registra um novo usuário, faz o hash da senha, cria um cookie de sessão e redireciona para a página principal.
 * @param {FormData} formData - Os dados do formulário de registro, contendo email, nome de usuário e senha.
 * @returns {Promise<void>} Redireciona em caso de sucesso ou retorna um objeto de erro se o e-mail/usuário já existir.
 * @example
 * const formData = new FormData();
 * formData.append('email', 'test@example.com');
 * formData.append('username', 'testuser');
 * formData.append('password', 'password123');
 * await register(formData);
 */
export async function register(formData: FormData): Promise<UserInterface> {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const emailExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (emailExists) throw new Error("Já existe um usuário com esse email");

    const userExists = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (userExists) throw new Error("Já existe um usuário com esse username");

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

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

/**
 * Cria uma solicitação de amizade entre o usuário logado e outro usuário.
 * @param {FormData} formData - Dados do formulário contendo o nome de usuário do usuário a ser adicionado (`searchInput`).
 * @returns {Promise<Friendship | null>} Retorna o objeto de amizade criado ou nulo se a sessão for inválida ou ocorrer um erro.
 * @example
 * const formData = new FormData();
 * formData.append('searchInput', 'friendUsername');
 * const friendship = await addFriend(formData);
 */
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

    if (!receiverUser) throw new Error("Não existe usuário com esse username");

    const friendship = await prisma.friendship.create({
      data: {
        receiverId: receiverUser?.id ? receiverUser.id : "",
        senderId,
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
            profilePicture: true,
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
            profilePicture: true,
          },
        },
      },
    });

    if (friendship) {
      await pusherServer.trigger(
        `user-${receiverUser.id}`,
        "friend-request-received",
        friendship,
      );
    }

    return friendship;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

/**
 * Realiza o login de um usuário, verifica as credenciais, cria um cookie de sessão, atualiza seu status online e retorna as informações do usuário.
 * @param {FormData} formData - Dados do formulário de login, contendo email and password.
 * @returns {Promise<UserInterface>} Retorna o objeto do usuário em caso de sucesso ou um objeto de erro em caso de falha.
 * @example
 * const formData = new FormData();
 * formData.append('email', 'user@example.com');
 * formData.append('password', 'password123');
 * const user = await login(formData);
 */
export async function login(formData: FormData): Promise<UserInterface> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("Não existe usuário com esse email");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("A senha não está correta");
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

    const res = await getUserInfo();
    if (!res) {
      throw new Error("Não foi possível obter as informações do usuário");
    }

    return res;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

/**
 * Realiza o logoff do usuário atual, atualiza seu status online para "OFFLINE", exclui o cookie de sessão e redireciona para a página de login.
 * @returns {Promise<boolean>} Redireciona o usuário para a página de login.
 * @example
 * await logoff();
 */
export async function logoff() {
  try {
    await updateOnlineStatus("OFFLINE");

    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message);
  }
}

/**
 * Recupera as informações do usuário atualmente logado a partir do cookie de sessão.
 * @returns {Promise<UserInterface | null>} Retorna o objeto do usuário (sem a senha) ou nulo se a sessão não for válida.
 * @example
 * const currentUser = await getUserInfo();
 */
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

/**
 * Recupera informações públicas de um usuário específico pelo seu ID.
 * @param {string} id - O ID exclusivo do usuário a ser recuperado.
 * @returns {Promise<UserInterface | null>} Retorna o objeto do usuário (sem a senha) ou nulo se o usuário não for encontrado.
 * @example
 * const user = await getOtherUserInfo('some-user-id');
 */
export async function getOtherUserInfo(
  id: string,
): Promise<UserInterface | null> {
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  console.log(userData);

  if (!userData) return null;

  const { password, ...userWithoutPassword } = userData;

  return userWithoutPassword;
}

/**
 * Busca todas as amizades (pendentes, aceitas, bloqueadas) para o usuário atualmente logado.
 * @returns {Promise<FriendshipWithUsers[] | null>} Retorna um array de objetos de amizade com detalhes do remetente e do destinatário, ou nulo em caso de erro/sessão inválida.
 * @example
 * const friendships = await getUserFriendships();
 */
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
            profilePicture: true,
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
            profilePicture: true,
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

/**
 * Recupera o histórico de mensagens entre o usuário logado e outro usuário especificado.
 * @param {string | null} receiverId - O ID do outro usuário na conversa.
 * @returns {Promise<MessageWithUsers[] | []>} Retorna uma array de objetos de mensagem, ordenados por data de criação, ou uma array vazia em caso de erro/sessão inválida.
 * @throws {Error} Se `receiverId` for nulo ou `senderId` não puder ser determinado a partir da sessão.
 * @example
 * const messages = await getMessagesHistory('receiver-user-id');
 */
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
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            profilePicture: true,
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

/**
 * Envia uma mensagem de um usuário para outro e aciona um evento do Pusher para notificar o destinatário em tempo real.
 * @param {string | undefined} senderId - O ID do remetente da mensagem.
 * @param {string} receiverId - O ID do destinatário da mensagem.
 * @param {string} message - O conteúdo da mensagem.
 * @param {string} friendshipId - O ID da amizade, usado como canal para o evento do Pusher.
 * @returns {Promise<MessageWithUsers | undefined>} Retorna o objeto da mensagem criada ou indefinido em caso de erro.
 * @throws {Error} Se `senderId` for indefinido.
 * @example
 * await sendMessage('sender-id', 'receiver-id', 'Hello!', 'friendship-id');
 */
export async function sendMessage(
  receiverId: string,
  message: string,
  images: string[],
  friendshipId: string,
): Promise<MessageWithUsers | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    throw new Error("Token não encontrado");
  }

  const sessionData = await decrypt(token);
  if (!sessionData) {
    throw new Error("Sessão não encontrada");
  }

  const senderId = sessionData.userId;

  if (!senderId) {
    throw new Error("Id do sender é undefined");
  }
  try {
    const createdMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        images,
        message,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            profilePicture: true,
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

/**
 * Atualiza o status de uma amizade (ex: ACEITA, BLOQUEADA) ou a exclui. O usuário deve fazer parte da amizade.
 * @param {FriendshipStatus | "DELETE"} val - O novo status a ser definido (`"ACCEPTED"`, `"BLOCKED"`, `"PENDING"`) ou `"DELETE"` para remover a amizade.
 * @param {string} friendshipId - O ID da amizade a ser modificada.
 * @returns {Promise<FriendshipWithUsers | undefined>} Retorna o objeto de amizade atualizado ou excluído, ou indefinido em caso de erro.
 * @throws {Error} Se a sessão for inválida, a amizade não existir ou o usuário não fizer parte da amizade.
 * @example
 * await changeFriendshipStatus("ACCEPTED", "friendship-id-123");
 * await changeFriendshipStatus("DELETE", "friendship-id-456");
 */
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
              profilePicture: true,
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
              profilePicture: true,
            },
          },
        },
      });

      if (deletedFriendship) {
        const otherUserId =
          deletedFriendship.senderId === userId
            ? deletedFriendship.receiverId
            : deletedFriendship.senderId;

        await pusherServer.trigger(
          `user-${otherUserId}`,
          "friendship-updated",
          {
            action: "DELETE",
            friendship: deletedFriendship,
          },
        );
      }

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
            profilePicture: true,
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
            profilePicture: true,
          },
        },
      },
      data: {
        status: val,
      },
    });

    if (updatedFriendship) {
      const otherUserId =
        updatedFriendship.senderId === userId
          ? updatedFriendship.receiverId
          : updatedFriendship.senderId;

      await pusherServer.trigger(`user-${otherUserId}`, "friendship-updated", {
        action: val,
        friendship: updatedFriendship,
      });
    }

    return updatedFriendship;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

/**
 * Atualiza o status online do usuário atualmente logado. É um invólucro em torno de `_updateUserStatus`.
 * @param {"ONLINE" | "ABSENT" | "OFFLINE"} status - The new online status.
 * @returns {Promise<UserInterface | null>} Retorna o objeto do usuário atualizado ou nulo em caso de erro/sessão inválida.
 * @example
 * await updateOnlineStatus("ABSENT");
 */
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

/**
 * (Função privada) Atualiza o status online de um usuário no banco de dados e notifica seus amigos via Pusher sobre a mudança de status.
 * @param {string} userId - O ID do usuário a ser atualizado.
 * @param {"ONLINE" | "ABSENT" | "OFFLINE"} status - O novo status online.
 * @returns {Promise<UserInterface | null>} Retorna o objeto do usuário atualizado (sem senha) ou nulo em caso de erro.
 * @example
 * // Uso interno apenas
 * await _updateUserStatus('user-id-123', 'ONLINE');
 */
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
      return pusherServer.trigger(`user-${targetId}`, "friend-status-changed", {
        userId,
        status,
      });
    });

    await pusherServer.trigger(`user-${userId}`, "own-status-changed", {
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

/**
 * Atualiza o conteúdo de uma mensagem enviada pelo usuário atualmente logado.
 * @param {string} messageId - O ID da mensagem a ser atualizada.
 * @param {string} newMessage - O novo conteúdo da mensagem.
 * @param {string[]} newImages - As novas mensagens.
 * @returns {Promise<MessageWithUsers | null>} Retorna o objeto da mensagem atualizada ou nulo se o usuário não for o remetente ou ocorrer um erro.
 * @example
 * await updateMessage('message-id-123', 'Este é o novo conteúdo da mensagem.', []);
 */
export async function updateMessage(
  messageId: string,
  newMessage: string,
  friendshipId: string,
  newImages: string[],
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
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) {
      console.error("Mensagem não encontrada");
      return null;
    }

    if (message) {
      const diffUrl = message.images.filter((url) => !newImages.includes(url));

      if (diffUrl.length > 0) {
        deleteImagesFromCloud(diffUrl);
      }
    }

    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId,
        senderId: userId,
      },
      data: {
        message: newMessage,
        images: newImages,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            profilePicture: true,
          },
        },
      },
    });

    if (updatedMessage) {
      await pusherServer.trigger(
        `${friendshipId}`,
        "message-updated",
        updatedMessage,
      );
    }

    return updatedMessage;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/**
 * Exclui uma mensagem enviada pelo usuário atualmente logado.
 * @param {string} messageId - O ID da mensagem a ser excluída.
 * @param {string} friendshipId - O ID da amizade
 * @returns {Promise<Message | null>} Retorna o objeto da mensagem excluída ou nulo se o usuário não for o remetente ou ocorrer um erro.
 * @example
 * await deleteMessage('message-id-123');
 */
export async function deleteMessage(
  messageId: string,
  friendshipId: string,
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
    const deletedMessage = await prisma.message.delete({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!deletedMessage) throw new Error("Não existe mensagem");

    deleteImagesFromCloud(deletedMessage.images);

    await pusherServer.trigger(`${friendshipId}`, "message-deleted", messageId);

    return deletedMessage;
  } catch (err) {
    console.log(err);
    return null;
  }
}

function deleteImagesFromCloud(urls: string[]): boolean {
  try {
    const deletePromises = urls.map((url) => {
      const publicId = extractPublicId(url);
      if (!publicId)
        throw new Error(
          "Não foi possível extrair o public id da url fornecida",
        );

      return cloudinary.uploader.destroy(publicId);
    });

    Promise.all(deletePromises).catch((err) => {
      console.error("ERRO CRÍTICO no brackground ao editar imagens:", err);
    });

    return true;
  } catch (err) {
    console.error(err);
  }
  return false;
}

function extractPublicId(url: string): string | null {
  const regex = /\/v\d+\/(.+)\.[a-zA-Z0-9]+$/;
  const match = url.match(regex);

  return match ? match[1] : null;
}
export async function updateUserInformation(data: {
  email: string;
  username: string;
  newPassword: string;
  previousPassword: string;
}): Promise<UserInterface> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      throw new Error("Token not found");
    }

    const sessionData = await decrypt(token);
    if (!sessionData || !sessionData.userId) {
      throw new Error("Session not found");
    }

    const userId = sessionData.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error("User not found");

    let updateData: any = {};
    const isEmailDiff = data.email !== user.email;
    const isUsernameDiff = data.username !== user.username;

    const isTryingToChangePassword = data.newPassword.trim() != "";

    if (isTryingToChangePassword) {
      const isPasswordCorrect = await bcrypt.compare(
        data.previousPassword,
        user.password,
      );

      if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
      }

      if (data.previousPassword == data.newPassword) {
        throw new Error("New password cannot be the same as the current one");
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (isEmailDiff) {
      if (data.email.trim() == "") throw new Error("Email cannot be empty");

      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) throw new Error("This email is already in use");

      updateData.email = data.email;
    }

    if (isUsernameDiff) {
      if (data.username.trim() == "")
        throw new Error("Username cannot be empty");

      const userExists = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (userExists) throw new Error("This username is already in use");

      updateData.username = data.username;
    }

    if (Object.keys(updateData).length == 0)
      throw new Error("Nothing was changed");

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...updateData,
      },
    });
    const { password, ...userWithoutPassword } = updatedUser;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const promises = friendships.map((f) => {
      const otherId =
        userWithoutPassword.id === f.senderId ? f.receiverId : f.senderId;

      return pusherServer.trigger(
        `user-${otherId}`,
        "friend-updated",
        userWithoutPassword,
      );
    });

    await Promise.all(promises);

    return userWithoutPassword;
  } catch (err: any) {
    throw new Error(err.message);
  }
}
