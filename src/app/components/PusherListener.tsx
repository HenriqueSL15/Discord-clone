"use client";

import { use, useEffect } from "react";
import { pusherClient } from "../lib/pusher-client";
import { useUserStore } from "../store/useUserStore";
import { FriendshipWithUsers } from "../types/Friendship";

export function PusherListener({ userId }: { userId: string }) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setFriendships = useUserStore((state) => state.setFriendships);

  const setActiveRoom = useUserStore((state) => state.setActiveRoom);
  const setVoiceChatToken = useUserStore((state) => state.setVoiceChatToken);

  useEffect(() => {
    const channelName = `user-${userId}`;
    console.log("Tentando se inscrever no canal:", channelName);
    const channel = pusherClient.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Inscrição confirmada no canal:", channelName);
    });

    channel.bind(
      "friend-status-changed",
      (data: { userId: string; status: "ONLINE" | "OFFLINE" | "ABSENT" }) => {
        setFriendships((prev: FriendshipWithUsers[] | null) => {
          if (!prev) return null;

          return prev.map((f) => {
            if (f.senderId == data.userId) {
              return {
                ...f,
                sender: {
                  ...f.sender,
                  onlineStatus: data.status as any,
                  lastOnline:
                    data.status == "ONLINE" ? new Date() : f.sender.lastOnline,
                },
              };
            }

            if (f.receiverId == data.userId) {
              return {
                ...f,
                receiver: {
                  ...f.receiver,
                  onlineStatus: data.status as any,
                  lastOnline:
                    data.status == "ONLINE"
                      ? new Date()
                      : f.receiver.lastOnline,
                },
              };
            }

            return f;
          });
        });
      },
    );

    channel.bind("call-incoming", (data: { senderId: string }) => {
      console.log("RECEBI A NOVA MENSAGEM DE CALL");
      const startPrivateChat = async (targetUserId: string) => {
        const myId = user?.id;
        const roomId = [myId, targetUserId].sort().join("---");

        if (!myId) {
          return "Não existe usuário ou sala";
        }

        setActiveRoom(roomId);
      };

      startPrivateChat(data.senderId);
    });

    channel.bind("call-ended", () => {
      setVoiceChatToken("");
      setActiveRoom("");
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [userId, setFriendships, setUser, setActiveRoom, user]);

  return null;
}
