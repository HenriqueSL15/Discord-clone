import { Dispatch, SetStateAction } from "react";
import { MessageWithUsers } from "../types/Message";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export default function EditingMessageBox({
  message,
  editInputRef,
  newImages,
  newMessage,
  handleEditMessage,
  setEditing,
  setNewMessage,
  setNewImages,
}: {
  message: MessageWithUsers;
  editInputRef: React.RefObject<HTMLInputElement>;
  newImages: string[] | null;
  newMessage: string;
  handleEditMessage: (
    messageId: string,
    previousMessage: string,
    previousImages: string[],
  ) => void;
  setEditing: Dispatch<SetStateAction<string>>;
  setNewMessage: Dispatch<SetStateAction<string>>;
  setNewImages: Dispatch<SetStateAction<string[] | null>>;
}) {
  return (
    <form
      className="flex flex-col p-4 gap-10"
      onLoad={() => {
        setNewImages(message.images);
        setNewMessage(message.message);
        editInputRef.current?.focus();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        handleEditMessage(message.id, message.message, message.images);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setNewImages(message.images);
          setNewMessage(message.message);
          setEditing("");
        }
      }}
    >
      {message.images && message.images.length > 0 && (
        <div className="grid grid-cols-4 overflow-y-auto w-full h-100">
          {newImages?.map((image, i) => {
            return (
              <div key={i} className="relative m-5">
                <Image
                  src={image}
                  alt="preview"
                  width={200}
                  height={200}
                  className="rounded-lg w-full h-auto object-contain bg-black/20 border border-white/10"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 hover:scale-110 transition-all"
                  onClick={(e) => {
                    e.preventDefault();

                    setNewImages((prev) => {
                      if (prev == null) return null;
                      return prev.filter((img) => img != image);
                    });

                    editInputRef.current?.focus();
                  }}
                >
                  <Trash2
                    className="text-red-500 bg-black/90 p-1 rounded-lg cursor-pointer"
                    width={40}
                    height={40}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <input
        className="text-[#c2c2c5] mb-2 text-lg relative w-full p-5 border-2 border-gray-700/50 rounded-sm bg-gray-700/20 outline-none break-words"
        onChange={(e) => setNewMessage(e.target.value)}
        ref={editInputRef}
        value={newMessage}
        autoFocus
      />
    </form>
  );
}
