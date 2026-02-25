"use server";

import { cookies } from "next/headers";
import { decrypt } from "../lib/auth";
import { pusherServer } from "../lib/pusher";

/**
 * Dispara um evento do Pusher para notificar um usuário sobre uma chamada recebida.
 * @param {string} targetUserId - O ID do usuário que receberá a chamada.
 * @returns {Promise<{ success: boolean } | { error: string }>}
 */
export async function triggerVoiceCall(targetUserId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return { error: "Não autorizado" };
  }

  const sessionData = await decrypt(token);
  if (!sessionData || !sessionData.userId) {
    return { error: "Sessão inválida" };
  }

  const senderId = sessionData.userId;

  try {
    console.log(`Disparando call-incoming para o canal: user-${targetUserId}`);
    await pusherServer.trigger(`user-${targetUserId}`, "call-incoming", {
      senderId,
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao disparar evento de voz no Pusher:", error);
    return { error: "Erro ao iniciar chamada" };
  }
}

export async function triggerVoiceChatEnd(targetUserId: string) {
  await pusherServer.trigger(`user-${targetUserId}`, "call-ended", {});
}
