"use client";

import { useEffect } from "react";
import { pusherClient } from "../lib/pusher-client";
import { useUserStore } from "../store/useUserStore";
import { FriendshipWithUsers } from "../types/Friendship";

export function PusherListener({ userId }: { userId: string }) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setFriendships = useUserStore((state) => state.setFriendships);

  useEffect(() => {
    const channel = pusherClient.subscribe(`private-user-${userId}`);

    channel.bind(
      "friend-status-changed",
      (data: { userId: string; status: "ONLINE" | "OFFLINE" | "ABSENT" }) => {
        setFriendships((prev: FriendshipWithUsers[] | null) => {
          console.log("aaaaaaaaaaaaaaaaaaaaa");
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

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-user-${userId}`);
    };
  }, [userId, setFriendships, setUser]);

  return null;
}
