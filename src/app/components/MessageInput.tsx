import Image from "next/image";
import UserInterface from "../types/User";
import { Plus, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export default function MessageInput({
  inputValue,
  setInputValue,
  handleSendMessage,
  previewImage,
  setPreviewImage,
  images,
  setImages,
  inputRef,
  handleChangeImage,
  otherUser,
}: {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  previewImage: string[];
  setPreviewImage: Dispatch<SetStateAction<string[]>>;
  images: File[];
  setImages: Dispatch<SetStateAction<File[]>>;
  inputRef: React.RefObject<HTMLInputElement>;
  handleChangeImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  otherUser: UserInterface | null;
}) {
  return (
    <form className="flex p-4 gap-10" action={handleSendMessage}>
      <div className="w-full  bg-[#21232b] flex flex-col gap-5 rounded-lg">
        {previewImage && previewImage.length > 0 && (
          <div className="grid grid-cols-4 overflow-y-auto w-full h-100">
            {previewImage.map((image, i) => {
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
                    onClick={() => {
                      setPreviewImage((prev) =>
                        prev.filter((img) => img != image),
                      );
                      setImages((prev) =>
                        prev.filter((img, index) => i != index),
                      );
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

        <div className="flex items-center">
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
            onChange={(e) => handleChangeImage(e)}
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
      </div>
    </form>
  );
}
