"use client";

export default function UserInfoButton(user: UserInterface) {
  return (
    <button className="flex gap-3 items-center hover:bg-[#23252d] w-1/2 h-full cursor-pointer transition-all rounded-lg">
      <div className="w-15 h-15 bg-black rounded-full"></div>
      <div className="flex flex-col text-start">
        <h1 className="text-xl text-white font-bold">{user.username}</h1>
        <h2 className="text-lg text-[#4a7699]">Online</h2>
      </div>
    </button>
  );
}
