"use client";

import UserInfoButton from "./UserInfoButton";
import IconButton from "./IconButton";
import { Mic, MicOff, Headphones, Volume2, Settings } from "lucide-react";

export default function UserInfo(user: UserInterface) {
  const icons = [[Mic, MicOff], [Headphones, Volume2], [Settings]];
  const actions = ["mic", "headphone", "userSettings"];

  return (
    <div className="w-full h-20 bg-[#0f0f13] p-1 rounded-lg flex">
      <UserInfoButton {...user} />
      <div className="text-white flex h-full items-center">
        {Array.from({ length: 3 }).map((value, index) => (
          <IconButton key={index} icon={icons[index]} action={actions[index]} />
        ))}
      </div>
    </div>
  );
}
