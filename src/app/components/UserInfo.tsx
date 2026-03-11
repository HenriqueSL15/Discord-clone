"use client";

import UserInfoButton from "./UserInfoButton";
import MicButton from "./Sidebar/MicButton";
import SoundButton from "./Sidebar/SoundButton";
import SettingsButton from "./Sidebar/SettingsButton";

export default function UserInfo() {
  return (
    <div className="w-full h-20 bg-[#0f0f13] p-1 rounded-lg flex">
      <UserInfoButton />
      <div className="text-white flex h-full items-center">
        <MicButton />
        <SoundButton />
        <SettingsButton />
      </div>
    </div>
  );
}
