"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import { FriendshipWithUsers } from "../../types/Friendship";
import UserInterface from "@/app/types/User";
import { getOtherUserInfo } from "@/app/actions/auth";
import Image from "next/image";
export default function FriendsList() {
  const user = useUserStore((state) => state.user);
  const friendships = useUserStore((state) => state.friendships);

  const updatePage = useUserStore((state) => state.setPage);
  const page = useUserStore((state) => state.page);
  const validFriendships = friendships?.filter(
    (f) => f.status != "PENDING" && f.status != "BLOCKED",
  );
  const activeRoom = useUserStore((state) => state.activeRoom);
  const setActiveRoom = useUserStore((state) => state.setActiveRoom);
  const setVoiceChatToken = useUserStore((state) => state.setVoiceChatToken);
  const voiceChatToken = useUserStore((state) => state.voiceChatToken);

  const [otherUser, setOtherUser] = useState<UserInterface | null>(null);

  const startPrivateChat = async (targetUserId: string) => {
    const myId = user?.id;
    const roomId = [myId, targetUserId].sort().join("---");

    if (!myId) {
      return "Não existe usuário ou sala";
    }

    const response = await fetch(
      `/api/get-participant-token?room=${roomId}&username=${myId}`,
    );
    const data = await response.json();

    setVoiceChatToken(data.token);
  };

  useEffect(() => {
    if (activeRoom && !voiceChatToken) {
      const otherUserId = activeRoom
        .split("---")
        .filter((id) => id != user?.id);
      const fetchOtherUserInfo = async (id: string) => {
        const info = await getOtherUserInfo(id);
        if (info) setOtherUser(info);
      };

      if (otherUserId[0]) fetchOtherUserInfo(otherUserId[0]);
    }
  }, [activeRoom, voiceChatToken, user?.id]);

  return (
    <div className="w-full flex-1 p-3">
      {activeRoom && !voiceChatToken && (
        <div className="absolute w-full h-full bg-black/40 left-0 top-0 z-50 flex items-center justify-center">
          <div className="w-1/3 h-1/3 bg-zinc-800 rounded-lg flex items-center justify-center flex-col gap-3">
            <h1 className="text-3xl font-bold text-white">
              {otherUser?.username} está te chamando!
            </h1>
            <div className="flex gap-3 w-full justify-center">
              <button
                className="w-1/3 h-15 rounded-lg bg-zinc-800 flex items-center justify-center p-2 hover:bg-emerald-600 transition-all cursor-pointer text-zinc-200 font-semibold"
                onClick={() => {
                  startPrivateChat(otherUser?.id as string);
                  updatePage(otherUser?.id as string);
                }}
              >
                Aceitar
              </button>
              <button
                className="w-1/3 h-15 rounded-lg bg-zinc-800 flex items-center justify-center p-2 hover:bg-red-600 transition-all cursor-pointer text-zinc-200 font-semibold"
                onClick={() => {
                  setActiveRoom("");
                }}
              >
                Negar
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-[#6f7c8c] font-bold text-lg">MENSAGENS DIRETAS</h1>
      <div className="w-full flex-1 flex flex-col mt-3 gap-2">
        {validFriendships?.map((friendship: FriendshipWithUsers, i: number) => {
          const otherPerson =
            friendship.sender.id == user?.id
              ? friendship.receiver
              : friendship.sender;

          const otherPersonStatus = otherPerson.onlineStatus.split("");
          const formattedStatus = otherPersonStatus
            .map((val, i) => {
              if (i != 0) {
                return val.toLowerCase();
              } else {
                return val;
              }
            })
            .join("");

          const statusColor =
            otherPerson.onlineStatus === "ONLINE"
              ? "bg-[#23a55a]"
              : otherPerson.onlineStatus === "ABSENT"
                ? "bg-[#f0b232]"
                : "bg-[#80848e]";

          return (
            <button
              key={i}
              className={`${
                page == otherPerson.id ? "bg-[#3a3d4a]" : ""
              } flex gap-3 items-center hover:bg-[#3a3d4a] w-full py-1 px-1 h-full cursor-pointer transition-all rounded-lg group`}
              onClick={() => updatePage(otherPerson.id)}
            >
              <div className="w-12 h-12 bg-black rounded-full relative">
                <Image
                  src={otherPerson?.profilePicture}
                  width={100}
                  height={100}
                  alt="profilePicture"
                  className="absolute right-0 bottom-0 rounded-full"
                />
                <div
                  className={`absolute right-0 bottom-0 ${statusColor} w-3 h-3 rounded-full`}
                ></div>
              </div>
              <div className="flex flex-col text-start">
                <h1
                  className={`${
                    page == otherPerson.id
                      ? "text-white"
                      : "group-hover:text-white"
                  } text-lg text-[#6f7c8c] font-bold  transition-all`}
                >
                  {otherPerson.username}
                </h1>
                <h2
                  className={`${
                    page == otherPerson.id
                      ? "text-white"
                      : "group-hover:text-white"
                  } text-sm text-[#525c69] transition-all`}
                >
                  {formattedStatus}
                </h2>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
