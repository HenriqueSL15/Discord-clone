"use client";
import { useEffect } from "react";
import { useUserStore } from "../../store/useUserStore";
import { FriendshipWithUsers } from "../../types/Friendship";
export default function FriendsList({
  friendships,
}: {
  friendships: FriendshipWithUsers[] | null;
}) {
  const user = useUserStore((state) => state.user);
  const setFriendships = useUserStore((state) => state.setFriendships);

  useEffect(() => {
    if (friendships) {
      setFriendships(friendships);
    }
  }, [friendships, setFriendships]);

  const updatePage = useUserStore((state) => state.setPage);
  const page = useUserStore((state) => state.page);
  const validFriendships = friendships?.filter(
    (f) => f.status != "PENDING" && f.status != "BLOCKED"
  );

  return (
    <div className="w-full flex-1 p-3">
      <h1 className="text-[#6f7c8c] font-bold text-lg">MENSAGENS DIRETAS</h1>
      <div className="w-full flex-1 flex flex-col mt-3 gap-2">
        {validFriendships?.map((friendship: FriendshipWithUsers, i: number) => {
          const otherUserId =
            friendship.sender.id == user?.id
              ? friendship.receiver.id
              : friendship.sender.id;

          return (
            <button
              key={i}
              className={`${
                page == otherUserId ? "bg-[#3a3d4a]" : ""
              } flex gap-3 items-center hover:bg-[#3a3d4a] w-full py-1 px-1 h-full cursor-pointer transition-all rounded-lg group`}
              onClick={() => updatePage(otherUserId)}
            >
              <div className="w-12 h-12 bg-black rounded-full relative">
                <div className="absolute right-0 bottom-0 bg-white w-3 h-3 rounded-full"></div>
              </div>
              <div className="flex flex-col text-start">
                <h1
                  className={`${
                    page == otherUserId
                      ? "text-white"
                      : "group-hover:text-white"
                  } text-lg text-[#6f7c8c] font-bold  transition-all`}
                >
                  {friendship.sender.id == user?.id
                    ? friendship.receiver.username
                    : friendship.sender.username}
                </h1>
                <h2
                  className={`${
                    page == otherUserId
                      ? "text-white"
                      : "group-hover:text-white"
                  } text-sm text-[#525c69] transition-all`}
                >
                  Online
                </h2>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
