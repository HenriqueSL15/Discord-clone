"use client";

import { useEffect } from "react";
import { pusherClient } from "../lib/pusher-client";
import { useUserStore } from "../store/useUserStore";
import { FriendshipWithUsers } from "../types/Friendship";
import UserInterface from "../types/User";
import { updateOnlineStatus } from "../actions/auth";

export function PusherListener({ userId }: { userId: string }) {
  const setFriendships = useUserStore((state) => state.setFriendships);

  const setActiveRoom = useUserStore((state) => state.setActiveRoom);
  const setVoiceChatToken = useUserStore((state) => state.setVoiceChatToken);

  useEffect(() => {
    const channelName = `user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", async () => {
      await updateOnlineStatus("ONLINE");
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
                  onlineStatus: data.status,
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
                  onlineStatus: data.status,
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
      const startPrivateChat = async (targetUserId: string) => {
        const myId = userId;
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

    channel.bind("friend-request-received", (data: FriendshipWithUsers) => {
      console.log("RECEBI O REQUEST");
      setFriendships((prev: FriendshipWithUsers[] | null) => {
        if (!prev) return [data];
        if (prev.find((f) => f.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    channel.bind(
      "friendship-updated",
      (data: { action: string; friendship: FriendshipWithUsers }) => {
        setFriendships((prev: FriendshipWithUsers[] | null) => {
          if (!prev) return null;

          if (data.action === "DELETE") {
            return prev.filter((f) => f.id !== data.friendship.id);
          }

          return prev.map((f) =>
            f.id === data.friendship.id ? data.friendship : f,
          );
        });
      },
    );

    channel.bind("friend-updated", (data: UserInterface) => {
      setFriendships((prev: FriendshipWithUsers[] | null) => {
        if (!prev) return null;
        return prev.map((f) => {
          if (f.senderId == data.id) return { ...f, sender: data };
          else if (f.receiverId == data.id) return { ...f, receiver: data };
          else return f;
        });
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [userId, setFriendships, setActiveRoom, setVoiceChatToken]);

  return null;
}
