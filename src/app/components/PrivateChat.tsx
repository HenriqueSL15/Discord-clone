"use client";
import React, { useEffect, useRef, useState } from "react";
import { MessageWithUsers } from "../types/Message";
import { useUserStore } from "../store/useUserStore";
import { LoaderCircle, X, Mic, MicOff } from "lucide-react";
import ZoomedImage from "./ZoomedImage";
import Message from "./Message";
import EditingMessageBox from "./EditingMessageBox";
import MessageInput from "./MessageInput";
import { usePrivateChat } from "../hooks/usePrivateChat";
import TopBar from "./TopBar";
import AudioChat from "./AudioChat";
import { triggerVoiceCall } from "../actions/voice";

export default function PrivateChat({ otherUserId }: { otherUserId: string }) {
  const activeRoom = useUserStore((state) => state.activeRoom);
  const setActiveRoom = useUserStore((state) => state.setActiveRoom);

  const voiceChatToken = useUserStore((state) => state.voiceChatToken);
  const setVoiceChatToken = useUserStore((state) => state.setVoiceChatToken);

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
    setActiveRoom(roomId);

    await triggerVoiceCall(targetUserId);
  };

  const goBackToCall = (targetUserId: string) => {
    const myId = user?.id;
    const roomId = [myId, targetUserId].sort().join("---");

    if (!myId) {
      return "Não existe usuário ou sala";
    }

    setActiveRoom(roomId);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState("");

  const user = useUserStore((state) => state.user);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { messages, isLoading, otherUser, editor, composer, deleting } =
    usePrivateChat(otherUserId);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeRoom == "") scrollToBottom();
  }, [activeRoom]);

  return (
    <div className="bg-[#1b1c22] w-4/5 flex flex-col justify-end h-screen">
      {!activeRoom && voiceChatToken ? (
        <div className="h-1/15 w-full flex items-center justify-between px-5 border-b border-zinc-700 bg-indigo-600/20">
          <h1 className="text-xl font-bold text-white">
            Chamada em andamento com {otherUser?.username}
          </h1>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all cursor-pointer"
              onClick={() => {
                goBackToCall(otherUser?.id as string);
              }}
            >
              Voltar
            </button>
          </div>
        </div>
      ) : !activeRoom ? (
        <TopBar otherUserId={otherUserId} startCall={startPrivateChat} />
      ) : null}

      {!activeRoom ? (
        <>
          <div className="flex flex-col w-full flex-1 p-3 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center flex-1 gap-2">
                <LoaderCircle
                  className="animate-spin"
                  color="white"
                  size={40}
                />
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
                const previousTime = new Date(
                  messages[i - 1]?.createdAt,
                ).getTime();
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
                    {editor.id != message.id ? (
                      <Message
                        user={user}
                        message={message}
                        isUpdated={isUpdated}
                        setSelectedImage={setSelectedImage}
                        setEditing={editor.setEditing}
                        setNewMessage={editor.setNewMessage}
                        handleDeleteMessage={deleting.handleDeleteMessage}
                        setNewImages={editor.setNewImages}
                      />
                    ) : (
                      editor.id == message.id && (
                        <EditingMessageBox
                          message={message}
                          editInputRef={
                            editInputRef as React.RefObject<HTMLInputElement>
                          }
                          newImages={editor.newImages}
                          newMessage={editor.newMessage}
                          handleEditMessage={editor.handleEditMessage}
                          setEditing={editor.setEditing}
                          setNewMessage={editor.setNewMessage}
                          setNewImages={editor.setNewImages}
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>
          <MessageInput
            inputValue={composer.inputValue}
            setInputValue={composer.setInputValue}
            handleSendMessage={composer.handleSendMessage}
            previewImage={composer.previewImage}
            setPreviewImage={composer.setPreviewImage}
            images={composer.images}
            setImages={composer.setImages}
            inputRef={inputRef as React.RefObject<HTMLInputElement>}
            handleChangeImage={composer.handleChangeImage}
            otherUser={otherUser}
          />
        </>
      ) : (
        activeRoom &&
        voiceChatToken && (
          <div className="w-full flex flex-col items-center justify-center flex-1 gap-10">
            <h1 className="text-4xl text-zinc-200">
              {user?.username} / {otherUser?.username}
            </h1>
            <div className="flex justify-center items-center gap-5">
              <AudioChat />
            </div>
          </div>
        )
      )}
      {selectedImage && (
        <ZoomedImage
          image={selectedImage}
          setSelectedImage={setSelectedImage}
        />
      )}
    </div>
  );
}
