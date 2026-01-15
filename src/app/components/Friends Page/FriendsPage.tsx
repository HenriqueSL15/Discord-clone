"use client";
import { Users } from "lucide-react";
import FriendsPageButton from "./FriendsPageButton";
import { useState } from "react";
import SearchInput from "./FriendsList";
import AddFriendPage from "./AddFriendPage";
import { addFriend } from "../../actions/auth";
import { useUserStore } from "../../store/useUserStore";
import { FriendshipWithUsers } from "../../types/Friendship";

export default function FriendsPage() {
  const [selectedOption, setSelectedOption] = useState(0);
  const user = useUserStore((state) => state.user);
  let friendships = useUserStore((state) => state.friendships);
  const [search, setSearch] = useState("");

  const texts = ["Online", "Todos", "Pendente", "Bloqueado"];
  const params = ["ONLINE", "", "PENDING", "BLOCKED"];

  const handleAddFriend = async (formData: FormData) => {
    const res = await addFriend(user?.id as string, formData);
    if (res?.id) {
      console.log("YEY");
    }
  };

  if (!friendships) {
    friendships = [];
  }

  const filteredFriendships = friendships?.filter(
    (friendship: FriendshipWithUsers) => {
      if (params[selectedOption] != "") {
        if (params[selectedOption] == "PENDING") {
          return (
            friendship.status == params[selectedOption] &&
            user?.id != friendship.senderId
          );
        } else {
          return friendship.status == params[selectedOption];
        }
      } else {
        return friendship.status != "PENDING" && friendship.status != "BLOCKED";
      }
    }
  );

  return (
    <div className="w-4/5 bg-[#1b1c22] h-screen">
      <div className="w-full h-13 border-b border-[#272a32] p-3 flex gap-5">
        <h1
          className={`flex gap-3 w-32 text-xl items-center justify-start border-r border-[#272a32]`}
        >
          <Users color="#7588a3" />
          <span className="text-white font-semibold cursor-default">
            Amigos
          </span>
        </h1>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => {
            return (
              <FriendsPageButton
                key={i}
                selectedOption={selectedOption == i}
                setSelectedOption={setSelectedOption}
                id={i}
                text={texts[i]}
                number={
                  friendships?.filter((friendship: FriendshipWithUsers) => {
                    if (params[i] != "") {
                      if (params[i] == "PENDING") {
                        return (
                          friendship.status == params[i] &&
                          user?.id != friendship.senderId
                        );
                      } else {
                        return friendship.status == params[i];
                      }
                    } else {
                      return (
                        friendship.status != "PENDING" &&
                        friendship.status != "BLOCKED"
                      );
                    }
                  }).length
                }
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
