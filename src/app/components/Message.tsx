import { Dispatch, SetStateAction } from "react";
import { MessageWithUsers } from "../types/Message";
import Image from "next/image";
import UserInterface from "../types/User";
import { Pencil, Trash2 } from "lucide-react";
export default function Message({
  message,
  user,
  isUpdated,
  setSelectedImage,
  setEditing,
  setNewMessage,
  handleDeleteMessage,
  setNewImages,
}: {
  message: MessageWithUsers;
  user: UserInterface | null;
  isUpdated: boolean;
  setSelectedImage: Dispatch<SetStateAction<string>>;
  setEditing: Dispatch<SetStateAction<string>>;
  setNewMessage: Dispatch<SetStateAction<string>>;
  handleDeleteMessage: (messageId: string) => void;
  setNewImages: Dispatch<SetStateAction<string[] | null>>;
}) {
  return (
    <h1 className="text-[#c2c2c5] text-lg relative">
      {message.images.length > 0 && (
        <div className="flex gap-3 max-w-1/5">
          {message.images.map((image, i) => {
            return (
              <Image
                src={image}
                alt={`image-${i}`}
                key={i}
                width={200}
                height={200}
                className="rounded-lg w-full h-auto object-contain"
                onClick={() => {
                  setSelectedImage(image);
                  console.log("Nova imagem clicada", image);
                }}
              />
            );
          })}
        </div>
      )}
      {message.message}{" "}
      {isUpdated && (
        <span className="text-base font-normal text-[#75869f]">(editado)</span>
      )}
      {message.senderId == user?.id && (
        <div className="flex gap-3 absolute top-1 right-1 items-center">
          <Pencil
            data-testid="edit-message"
            size={20}
            className="opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110 transition-transform"
            onClick={() => {
              setEditing(message.id);
              setNewMessage(message.message);
              setNewImages(message.images);
            }}
          />
          <Trash2
            data-testid="delete-message"
            size={20}
            className="opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110 transition-transform"
            onClick={() => handleDeleteMessage(message.id)}
          />
        </div>
      )}
    </h1>
  );
}
