"use client";
import { useEffect, useRef, useState } from "react";
import {
  deleteMessage,
  getMessagesHistory,
  getOtherUserInfo,
  getUserFriendships,
  sendMessage,
  updateMessage,
} from "../actions/auth";
import { MessageWithUsers } from "../types/Message";
import { useUserStore } from "../store/useUserStore";
import { pusherClient } from "../lib/pusher-client";
import { FriendshipWithUsers } from "../types/Friendship";
import { Pencil, Trash2, LoaderCircle, Plus } from "lucide-react";
import UserInterface from "../types/User";

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
  const [isLoading, setIsLoading] = useState(false);

  const [editing, setEditing] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      try {
        setIsLoading(true);
        const res = await getMessagesHistory(otherUserId);
        const otherUserInfo = await getOtherUserInfo(otherUserId);
        const friendships = await getUserFriendships();

        if (otherUserInfo) {
          setOtherUser(otherUserInfo);
        }

        if (friendships) {
          const currentFriendship = friendships.find(
            (friendship: FriendshipWithUsers) =>
              friendship.senderId == otherUserInfo?.id ||
              friendship.receiverId == otherUserInfo?.id,
          );

          if (currentFriendship) {
            setFriendshipId(currentFriendship.id);
            channel = pusherClient.subscribe(`${currentFriendship.id}`);

            channel.unbind("new-message");
            channel.bind("new-message", (data: MessageWithUsers) => {
              setMessages((prev) => {
                if (prev.find((m) => m.id == data.id)) return prev;
                return [...prev, data];
              });
            });
          }
        }
        if (res) setMessages(res);
      } catch (err) {
        console.log("Deu erro", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    return () => {
      if (channel) {
        channel.unbind("new-message");
        pusherClient.unsubscribe(`${channel.name}`);
      }
    };
  }, [otherUserId, user?.id]);

  const handleDeleteMessage = async (messageId: string) => {
    const allMessages = [...messages];
    setMessages((prev) => prev.filter((m) => m.id != messageId));
    const res = await deleteMessage(messageId);

    if ("error" in res) {
      console.log("deu erro");
      setMessages(allMessages);
    }
  };

  return (
    <div className="bg-[#1b1c22] w-4/5 flex flex-col justify-end h-screen">
      <div className="flex flex-col w-full flex-1 p-3 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center flex-1 gap-2">
            <LoaderCircle className="animate-spin" color="white" size={40} />
            <h1 className="text-white text-lg font-semibold">
              Carregando histórico de mensagens...
            </h1>
          </div>
        )}
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
            const previousDay = Number(
              new Date(messages[i - 1].createdAt).getDate(),
            );
            const previousMonth = Number(
              new Date(messages[i - 1].createdAt).getMonth(),
            );

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

          if (
            messages[i + 1] &&
            messages[i + 1]?.senderId == message.senderId
          ) {
            const nextTime = new Date(messages[i + 1].createdAt).getTime();
            const currentTime = new Date(message.createdAt).getTime();

            if ((nextTime - currentTime) / 1000 < 420) {
              nextMessageHasAGroup = true;
            }
          }

          let thisMessageHasAGroup = false;

          if (messages[i - 1]?.senderId == message.senderId) {
            const previousTime = new Date(messages[i - 1]?.createdAt).getTime();
            const currentTime = new Date(message.createdAt).getTime();

            if ((currentTime - previousTime) / 1000 < 420) {
              thisMessageHasAGroup = true;
            }
          }

          const isUpdated =
            new Date(message.createdAt).getTime() ==
            new Date(message.updatedAt).getTime()
              ? false
              : true;

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
                } break-words text-white group hover:bg-[#5c7ca0]/15 text-start rounded-sm`}
              >
                {!thisMessageHasAGroup && (
                  <h1 className="text-2xl font-semibold text-[#ffffff]">
                    {message.sender.username}{" "}
                    <span className="text-base font-normal text-[#75869f]">
                      {date} às {time}
                    </span>
                  </h1>
                )}
                {editing != message.id ? (
                  <h1 className="text-[#c2c2c5] text-lg relative">
                    {message.message}{" "}
                    {isUpdated && (
                      <span className="text-base font-normal text-[#75869f]">
                        (editado)
                      </span>
                    )}
                    {message.senderId == user?.id && (
                      <div className="flex gap-3 absolute top-1 right-1 items-center">
                        <Pencil
                          size={20}
                          className="opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => {
                            setEditing(message.id);
                            setNewMessage(message.message);
                          }}
                        />
                        <Trash2
                          size={20}
                          className="opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleDeleteMessage(message.id)}
                        />
                      </div>
                    )}
                  </h1>
                ) : (
                  editing == message.id && (
                    <form
                      className="flex p-4 gap-10"
                      action={async (formData: FormData) => {
                        if (newMessage.length > 0) {
                          const allMessages = [...messages];
                          setMessages((prev) =>
                            prev.map((m) => {
                              if (m.id == message.id)
                                return { ...m, message: newMessage };
                              return m;
                            }),
                          );

                          const res = await updateMessage(
                            message.id,
                            newMessage,
                          );

                          if ("error" in res) {
                            console.log("deu erro");
                            setMessages(allMessages);
                            setEditing("");
                          } else {
                            setEditing("");
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setNewMessage(message.message);
                          setEditing("");
                        }
                      }}
                    >
                      <input
                        className="text-[#c2c2c5] mb-2 text-lg relative w-full p-5 border-2 border-gray-700/50 rounded-sm bg-gray-700/20 outline-none break-words"
                        onChange={(e) => setNewMessage(e.target.value)}
                        value={newMessage}
                        autoFocus
                      />
                    </form>
                  )
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>
      <form
        className="flex p-4 gap-10"
        action={async (formData: FormData) => {
          const inputVal = inputValue;
          setInputValue("");

          const temporaryMessage: MessageWithUsers = {
            id: "temporary",
            sender: {
              id: user!.id,
              username: user!.username,
              email: user!.email,
              createdAt: user!.createdAt,
            },
            senderId: user!.id,
            receiver: {
              id: otherUser!.id,
              username: otherUser!.username,
              email: otherUser!.email,
              createdAt: otherUser!.createdAt,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            message: inputVal,
            receiverId: otherUserId as string,
          };

          setMessages((prev) => [...prev, temporaryMessage]);

          const res = await sendMessage(
            otherUserId as string,
            inputVal,
            friendshipId,
          );

          if ("error" in res) {
            console.log("deu erro");
            setMessages((prev) => prev.filter((m) => m.id != "temporary"));
            setInputValue(inputVal);
          } else {
            setMessages((prev) => prev.filter((m) => m.id != "temporary"));
            setInputValue("");
          }
        }}
      >
        <div className="w-full max-h-15 bg-[#21232b] flex items-center">
          {/* #8b8d93 */}

          <button
            type="button"
            className="w-10 mx-3 aspect-square hover:bg-white/20 transition-all rounded-lg flex items-center justify-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Plus
              size={40}
              className="left-0 top-0 text-[#8b8d93] hover:text-white transition-all"
            />
          </button>

          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept="image/*"
          />

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            placeholder={`Conversar com ${
              otherUser ? otherUser.username : "o usuário"
            }`}
            className="flex-1 p-3 rounded-lg text-[#8aabc8] font-semibold outline-none text-lg"
          />
        </div>
      </form>
    </div>
  );
}
