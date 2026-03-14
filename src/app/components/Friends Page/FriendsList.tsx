"use client";
import { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import { FriendshipWithUsers } from "../../types/Friendship";
import { X, Check } from "lucide-react";
import { changeFriendshipStatus } from "../../actions/auth";
import Image from "next/image";

export default function FriendsList({
  filteredFriendships,
}: {
  filteredFriendships: FriendshipWithUsers[];
}) {
  const [search, setSearch] = useState("");
  const user = useUserStore((state) => state.user);
  const setFriendships = useUserStore((state) => state.setFriendships);

  const handleUpdateFriendship = async (
    val: "ACCEPTED" | "DELETE",
    friendshipId: string,
  ) => {
    const res = await changeFriendshipStatus(val, friendshipId);

    if (res) {
      setFriendships((prev: FriendshipWithUsers[] | null) => {
        if (!prev) return null;
        if (val === "DELETE") {
          return prev.filter((f) => f.id !== friendshipId);
        }
        return prev.map((f) => (f.id === friendshipId ? res : f));
      });
    }
  };

  const validFriendships = filteredFriendships?.filter((f) => {
    if (user?.id == f.senderId) {
      return f.receiver.username.includes(search);
    } else {
      return f.sender.username.includes(search);
    }
  });

  const setPage = useUserStore((state) => state.setPage);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="bg-[#121317] px-3 py-2 rounded-lg text-[#5c7ca0] font-semibold outline-none"
      />
      <div className="flex flex-col">
        {validFriendships?.map((friendship: FriendshipWithUsers, index) => {
          const otherPerson =
            friendship.sender.id == user?.id
              ? friendship.receiver
              : friendship.sender;

          const statusColor =
            otherPerson.onlineStatus === "ONLINE"
              ? "bg-[#23a55a]"
              : otherPerson.onlineStatus === "ABSENT"
                ? "bg-[#f0b232]"
                : "bg-[#80848e]";
          return (
            <button
              key={index}
              className={`flex gap-3 items-center ${
                friendship.status != "PENDING" ? "hover:cursor-pointer" : ""
              }`}
              onClick={() => {
                if (friendship.status == "ACCEPTED") {
                  const otherId =
                    friendship.senderId == user?.id
                      ? friendship.receiverId
                      : friendship.senderId;

                  setPage(otherId);
                }
              }}
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
              <div className="flex justify-between items-center flex-1">
                <h1 className="text-xl text-white font-bold">
                  {friendship.sender.id == user?.id
                    ? friendship.receiver.username
                    : friendship.sender.username}
                </h1>
                {friendship.status == "PENDING" &&
                  friendship.senderId != user?.id && (
                    <div className="flex gap-3 text-white">
                      <div
                        className="bg-[#202227] hover:bg-[#2a2d33] p-2 rounded-full cursor-pointer transition-all"
                        onClick={() =>
                          handleUpdateFriendship("ACCEPTED", friendship.id)
                        }
                      >
                        {" "}
                        <Check data-testid="Check" />
                      </div>
                      <div
                        className="bg-[#202227] hover:bg-[#2a2d33] p-2 rounded-full cursor-pointer transition-all"
                        onClick={() =>
                          handleUpdateFriendship("DELETE", friendship.id)
                        }
                      >
                        <X data-testid="X" />
                      </div>
                    </div>
                  )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
