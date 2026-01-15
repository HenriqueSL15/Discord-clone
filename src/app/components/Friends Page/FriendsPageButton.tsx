import { Dispatch, SetStateAction } from "react";

export default function FriendsPageButton({
  text,
  number,
  id,
  selectedOption,
  setSelectedOption,
}: {
  text: string;
  number: number;
  id: number;
  selectedOption: boolean;
  setSelectedOption: Dispatch<SetStateAction<number>>;
}) {
  return (
    <button
      className={`p-2 transition-all flex items-center justify-center gap-1 ${
        selectedOption
          ? "bg-[#333741] text-white"
          : "hover:bg-[#282b33] text-[#6783a0]"
      } rounded-lg cursor-pointer`}
      onClick={() => setSelectedOption(id)}
    >
      <h1 className="font-bold">{text}</h1>

      <h1 className="font-medium">{number}</h1>
    </button>
  );
}
