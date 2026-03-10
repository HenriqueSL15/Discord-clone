"use client";
import { Users, Menu } from "lucide-react";
import FriendsPageButton from "./FriendsPageButton";
import { useState } from "react";
import SearchInput from "./FriendsList";
import AddFriendPage from "./AddFriendPage";
import { addFriend } from "../../actions/auth";
import { useUserStore } from "../../store/useUserStore";
import { FriendshipWithUsers } from "../../types/Friendship";
import { toast } from "sonner";

export default function FriendsPage() {
  const [selectedOption, setSelectedOption] = useState(0);
  const user = useUserStore((state) => state.user);
  let friendships = useUserStore((state) => state.friendships);
  const [search, setSearch] = useState("");
  const setSidebarOpen = useUserStore((state) => state.setSidebarOpen);

  const texts = ["Online", "Todos", "Pendente", "Bloqueado"];
  const params = ["ONLINE", "", "PENDING", "BLOCKED"];

  const setFriendships = useUserStore((state) => state.setFriendships);

  const handleAddFriend = async (formData: FormData) => {
    const res = addFriend(formData);

    toast.promise(res, {
      loading: "Enviando solicitação...",
      success: (result) => {
        if (result) {
          setFriendships((prev: FriendshipWithUsers[] | null) => {
            if (!prev) return [result as any];
            return [...prev, result as any];
          });
        }
        return "Solicitação enviada!";
      },
      error: (error) => {
        return error.message;
      },
    });
  };

  if (!friendships) {
    friendships = [];
  }

  const getFilteredFriendships = (param: string) => {
    return friendships?.filter((friendship: FriendshipWithUsers) => {
      const otherPerson =
        friendship.sender.id === user?.id
          ? friendship.receiver
          : friendship.sender;

      if (param === "ONLINE") {
        return (
          friendship.status === "ACCEPTED" &&
          otherPerson.onlineStatus === "ONLINE"
        );
      } else if (param === "PENDING") {
        return friendship.status === "PENDING" && user?.id !== friendship.senderId;
      } else if (param === "BLOCKED") {
        return friendship.status === "BLOCKED";
      } else {
        // "Todos"
        return friendship.status !== "PENDING" && friendship.status !== "BLOCKED";
      }
    });
  };

  const filteredFriendships = getFilteredFriendships(params[selectedOption]) || [];

  return (
    <div className="w-full bg-[#1b1c22] h-screen">
      <div className="w-full h-13 border-b border-[#272a32] p-3 flex gap-5 items-center">
        <Menu
          className="md:hidden text-zinc-300 cursor-pointer"
          onClick={() => setSidebarOpen(true)}
        />
        <h1
          className={`flex gap-3 w-32 text-xl items-center justify-start md:border-r border-[#272a32]`}
        >
          <Users color="#7588a3" />
          <span className="text-white font-semibold cursor-default hidden md:inline">
            Amigos
          </span>
        </h1>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {Array.from({ length: 4 }).map((_, i) => {
            return (
              <FriendsPageButton
                key={i}
                selectedOption={selectedOption == i}
                setSelectedOption={setSelectedOption}
                id={i}
                text={texts[i]}
                number={getFilteredFriendships(params[i])?.length || 0}
              />
            );
          })}
          <button
            className={`p-2 transition-all flex items-center justify-center gap-1 ${
              selectedOption == 4
                ? "bg-[#1c3e2d] text-[#1cca51]"
                : "hover:bg-[#282b33] text-[#6783a0]"
            } rounded-lg cursor-pointer`}
            onClick={() => setSelectedOption(4)}
          >
            <h1 className="font-bold">Adicionar Amigo</h1>
          </button>
        </div>
      </div>
      <div className="w-full p-3 flex flex-col">
        {selectedOption == 4 ? (
          <AddFriendPage
            handleAddFriend={handleAddFriend}
            search={search}
            setSearch={setSearch}
          />
        ) : (
          <SearchInput filteredFriendships={filteredFriendships} />
        )}
      </div>
    </div>
  );
}
