"use client";
import { useEffect, useState } from "react";
import { getMessagesHistory, sendMessage } from "../actions/auth";
import { MessageWithUsers } from "../types/Message";
import { useUserStore } from "../store/useUserStore";

export default function PrivateChat({
  otherUserId,
}: {
  otherUserId: string | null;
}) {
  const user = useUserStore((state) => state.user);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!otherUserId) {
      return;
    }
    const fetchHistory = async () => {
      const res = await getMessagesHistory(user?.id, otherUserId);

      setMessages(res);
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-[#1b1c22] w-4/5 flex flex-col justify-end">
      <div className="flex flex-col gap-3 w-full flex-1 p-3">
        {messages.map((message: MessageWithUsers, i: number) => {
          const fullDate = message.createdAt.toLocaleString();
          const date = fullDate.split(",")[0];
          const time = fullDate
            .split(",")[1]
            .trim()
            .split(":")[0]
            .concat(":", fullDate.split(",")[1].trim().split(":")[1]);

          return (
            <div
              key={i}
              className={`text-xl p-2 break-words text-white hover:bg-[#5c7ca0]/15 text-start rounded-sm`}
            >
              <h1 className="text-xl font-bold">
                {message.sender.username}{" "}
                <span className="text-sm font-normal text-[#75869f]">
                  {date} às {time}
                </span>
              </h1>
              <h1>{message.message}</h1>
            </div>
          );
        })}
      </div>
      <form
        className="flex p-4 gap-10"
        action={async (formData: FormData) => {
          const res = await sendMessage(
            user?.id,
            otherUserId as string,
            inputValue
          );
          if ("error" in res) {
            console.log("deu erro");
          } else {
            setInputValue("");
          }
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          placeholder={`Conversar com fulano de tal`}
          className="bg-[#21232b] w-full p-3 rounded-lg text-[#8aabc8] font-semibold outline-none text-lg"
        />
      </form>
    </div>
  );
}
