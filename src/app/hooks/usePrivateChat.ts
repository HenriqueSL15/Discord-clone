import { useEffect, useState } from "react";
import {
  deleteMessage,
  getMessagesHistory,
  getOtherUserInfo,
  getUserFriendships,
  sendMessage,
  updateMessage,
} from "../actions/auth";
import { FriendshipWithUsers } from "../types/Friendship";
import { pusherClient } from "../lib/pusher-client";
import { MessageWithUsers } from "../types/Message";
import { useUserStore } from "../store/useUserStore";
import UserInterface from "../types/User";
import api from "../api/api";

export function usePrivateChat(otherUserId: string) {
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageWithUsers[]>([]);
  const [otherUser, setOtherUser] = useState<UserInterface | null>(null);
  const [friendshipId, setFriendshipId] = useState<string>("");

  const [editing, setEditing] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newImages, setNewImages] = useState<string[] | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [previewImage, setPreviewImage] = useState<string[]>([]);

  useEffect(() => {
    if (!otherUserId) {
      return;
    }

    let channel: any;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);

        const [res, otherUserInfo, friendships] = await Promise.all([
          getMessagesHistory(otherUserId),
          getOtherUserInfo(otherUserId),
          getUserFriendships(),
        ]);

        if (!otherUserInfo) return;
        setOtherUser(otherUserInfo);

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
                if (prev.find((m) => m.id === data.id)) return prev;

                const tempIndex = prev.findIndex((m) => m.id === "temporary");
                if (tempIndex !== -1) {
                  const newMessages = [...prev];
                  newMessages[tempIndex] = data;
                  return newMessages;
                }
                return [...prev, data];
              });
            });

            channel.bind("message-updated", (updatedMsg: MessageWithUsers) => {
              setMessages((prev) =>
                prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
              );
            });

            channel.bind("message-deleted", (deletedMsgId: string) => {
              setMessages((prev) => prev.filter((m) => m.id !== deletedMsgId));
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

  const handleEditMessage = async (
    messageId: string,
    previousMessage: string,
    previousImages: string[],
  ) => {
    const isMessageDifferent = previousMessage.trim() != newMessage.trim();
    const areImagesDifferent =
      JSON.stringify(previousImages) != JSON.stringify(newImages);

    if (!areImagesDifferent && !isMessageDifferent)
      return console.log("Nada mudou");
    if (newImages && newImages.length == 0 && newMessage.length == 0)
      return console.log("Sem imagens não pode ficar sem texto");

    const allMessages = [...messages];
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id == messageId)
          return {
            ...m,
            message: newMessage,
            images: newImages ?? [],
            updatedAt: new Date(),
          };
        return m;
      }),
    );

    const res = await updateMessage(
      messageId,
      newMessage,
      friendshipId,
      newImages ?? [],
    );

    if (res == null) return console.log("Res não existe");
    if ("error" in res) {
      console.log("deu erro");
      setMessages(allMessages);
      setEditing("");
    } else {
      setEditing("");
    }
  };

  const handleSendMessage = async () => {
    const inputVal = inputValue.trim();
    const tempPreviewImages = [...previewImage];
    const tempImages = [...images];

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
      images: tempPreviewImages,
      receiverId: otherUserId as string,
    };

    let res;

    if (images.length > 0) {
      setInputValue("");
      setImages([]);
      setPreviewImage([]);
      setMessages((prev) => [...prev, temporaryMessage]);

      const form = new FormData();
      images.forEach((image) => {
        form.append("images", image);
      });

      const imagesURLs = await api
        .post("/api/sendImages", form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          return res.data.urls;
        })
        .catch((err) => console.log("Deu erro", err));

      res = await sendMessage(
        otherUserId as string,
        inputVal,
        imagesURLs,
        friendshipId,
      );
    } else {
      if (inputVal == "") return console.log("Mensagem está vazia");

      setInputValue("");
      setImages([]);
      setPreviewImage([]);
      setMessages((prev) => [...prev, temporaryMessage]);

      res = await sendMessage(
        otherUserId as string,
        inputVal,
        [],
        friendshipId,
      );
    }

    if ("error" in res!) {
      setMessages((prev) => prev.filter((m) => m.id != "temporary"));
      setImages(tempImages);
      setPreviewImage(tempPreviewImages);
      setInputValue(inputVal);
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === "temporary" ? (res as MessageWithUsers) : m)),
      );
      setInputValue("");
    }
  };

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previewImage.length >= 4) return;
    if (!e.target.files) return;
    const file = e.target.files[0];
    e.target.value = "";
    const temporaryURL = URL.createObjectURL(file);
    setImages((prev) => [...prev, file]);
    setPreviewImage((prev) => [...prev, temporaryURL]);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const allMessages = [...messages];
    setMessages((prev) => prev.filter((m) => m.id != messageId));
    const res = await deleteMessage(messageId, friendshipId);

    if (!res) return console.log("Res não existe");
    if ("error" in res) {
      console.log("deu erro");
      setMessages(allMessages);
    }
  };

  return {
    messages,
    isLoading,
    otherUser,
    editor: {
      id: editing,
      newMessage,
      newImages,
      handleEditMessage,
      setEditing,
      setNewMessage,
      setNewImages,
    },
    composer: {
      handleSendMessage,
      previewImage,
      setPreviewImage,
      handleChangeImage,
      inputValue,
      setInputValue,
      images,
      setImages,
    },
    deleting: {
      handleDeleteMessage,
    },
  };
}
