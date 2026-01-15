"use client";
import { useEffect, useRef, useState } from "react";
import {
  getMessagesHistory,
  getOtherUserInfo,
  getUserFriendships,
  sendMessage,
} from "../actions/auth";
import { MessageWithUsers } from "../types/Message";
import { useUserStore } from "../store/useUserStore";
import { pusherClient } from "../lib/pusher-client";
import { FriendshipWithUsers } from "../types/Friendship";

export default function PrivateChat({
  otherUserId,
}: {
  otherUserId: string | null;
}) {
  const user = useUserStore((state) => state.user);
  const [otherUser, setOtherUser] = useState<UserInterface>();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<MessageWithUsers[]>([]);
  const [friendshipId, setFriendshipId] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!otherUserId) {
      return;
    }

    let channel: any;

    const fetchHistory = async () => {
      const res = await getMessagesHistory(user?.id, otherUserId);
      const otherUserInfo = await getOtherUserInfo(otherUserId);
      const friendships = await getUserFriendships();

      if (otherUserInfo) {
        setOtherUser(otherUserInfo);
      }

      if (friendships) {
        const currentFriendship = friendships.find(
          (friendship: FriendshipWithUsers) =>
            friendship.senderId == otherUserInfo?.id ||
            friendship.receiverId == otherUserInfo?.id
        );

        if (currentFriendship) {
          setFriendshipId(currentFriendship.id);
          channel = pusherClient.subscribe(`${currentFriendship.id}`);

          channel.bind("new-message", (data: MessageWithUsers) => {
            setMessages((prev) => [...prev, data]);
          });
        }
      }
      if (res) setMessages(res);
    };

    fetchHistory();

    return () => {
      if (channel) {
        channel.unbind("new-message");
        pusherClient.unsubscribe(`${channel.name}`);
      }
    };
  }, [otherUserId, user?.id]);

  return (
    <div className="bg-[#1b1c22] w-4/5 flex flex-col justify-end h-screen">
      <div className="flex flex-col w-full flex-1 p-3 overflow-y-auto">
        {messages.map((message: MessageWithUsers, i: number) => {
          const fullDate = new Date(message.createdAt).toLocaleString();

          const date = fullDate.split(",")[0];
          const time = fullDate
            .split(",")[1]
            .trim()
            .split(":")[0]
            .concat(":", fullDate.split(",")[1].trim().split(":")[1]);

          let previousMessage = null;
          if (messages[i - 1]) {
            const previousDay = Number(messages[i - 1].createdAt.getDate());
            const previousMonth = Number(messages[i - 1].createdAt.getMonth());

            const currentDay = new Date(message.createdAt).getDate();
            const currentMonth = new Date(message.createdAt).getMonth();

            if (previousDay < currentDay && previousMonth == currentMonth) {
              previousMessage = messages[i - 1];
            } else if (
              previousDay > currentDay &&
              previousMonth < currentMonth
            ) {
              previousMessage = messages[i - 1];
            }
          }

          let nextMessageHasAGroup = false;

          if (messages[i + 1]?.senderId == message.senderId) {
            const nextTime = messages[i + 1]?.createdAt.getTime();
            const currentTime = new Date(message.createdAt).getTime();

            if ((nextTime - currentTime) / 1000 < 420) {
              nextMessageHasAGroup = true;
            }
          }

          let thisMessageHasAGroup = false;

          if (messages[i - 1]?.senderId == message.senderId) {
            const previousTime = messages[i - 1]?.createdAt.getTime();
            const currentTime = new Date(message.createdAt).getTime();

            if ((currentTime - previousTime) / 1000 < 420) {
              thisMessageHasAGroup = true;
            }
          }

          return (
            <div
              key={i}
              className={`${nextMessageHasAGroup ? "mb-0" : "mb-5"}`}
            >
              {previousMessage && (
                <div className="flex justify-between items-center gap-1 mb-2">
                  <div className="w-1/2 h-px bg-[#3c3c41]"></div>
                  <h1 className="text-[14px] text-[#85868d]">{date}</h1>
                  <div className="w-1/2 h-px bg-[#3c3c41]"></div>
                </div>
              )}
              <div
                className={`text-xl ${
                  !thisMessageHasAGroup ? "px-2" : "px-2"
                } break-words text-white hover:bg-[#5c7ca0]/15 text-start rounded-sm`}
              >
                {!thisMessageHasAGroup && (
                  <h1 className="text-2xl font-semibold text-[#ffffff]">
                    {message.sender.username}{" "}
                    <span className="text-base font-normal text-[#75869f]">
                      {date} às {time}
                    </span>
                  </h1>
                )}

                <h1 className="text-[#c2c2c5] text-lg">{message.message}</h1>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>
      <form
        className="flex p-4 gap-10"
        action={async (formData: FormData) => {
          const res = await sendMessage(
            user?.id,
            otherUserId as string,
            inputValue,
            friendshipId
          );
          const inputVal = inputValue;
          setInputValue("");

          if ("error" in res) {
            console.log("deu erro");
            setInputValue(inputVal);
          } else {
            setInputValue("");
          }
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          placeholder={`Conversar com ${
            otherUser ? otherUser.username : "o usuário"
          }`}
          className="bg-[#21232b] w-full p-3 rounded-lg text-[#8aabc8] font-semibold outline-none text-lg"
        />
      </form>
    </div>
  );
}
