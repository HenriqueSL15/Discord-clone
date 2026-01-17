"use client";
import { useUserStore } from "../store/useUserStore";
export default function UserInfoButton() {
  const user = useUserStore((state) => state.user);

  const userStatus = user?.onlineStatus.split("");
  const formattedStatus = userStatus?.map((val, i) => {
    if (i != 0) {
      return val.toLowerCase();
    } else {
      return val;
    }
  });

  formattedStatus?.join("");
  return (
    <button className="flex gap-3 items-center hover:bg-[#23252d] w-1/2 h-full cursor-pointer transition-all rounded-lg">
      <div className="w-12 h-12 bg-black rounded-full relative">
        <div className="absolute right-0 bottom-0 bg-white w-3 h-3 rounded-full"></div>
      </div>
      <div className="flex flex-col text-start">
        <h1 className="text-lg text-white font-bold">{user?.username}</h1>
        <h2 className="text-sm text-[#4a7699]">{formattedStatus}</h2>
      </div>
    </button>
  );
}
