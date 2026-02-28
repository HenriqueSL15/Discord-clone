"use client";

import { useUserStore } from "@/app/store/useUserStore";
import { Mic, MicOff } from "lucide-react";

export default function SettingsButton() {
  const isMuted = useUserStore((state) => state.isMuted);
  const setIsMuted = useUserStore((state) => state.setIsMuted);

  return (
    <>
      <button
        onClick={() => {
          setIsMuted(!isMuted);
        }}
        className="relative rounded-lg transition-all h-2/3 flex items-center justify-center hover:bg-white/10 p-3 cursor-pointer"
      >
        {!isMuted ? (
          <Mic className="h-full w-full" />
        ) : (
          <MicOff className="h-full w-full text-red-500" />
        )}
      </button>
    </>
  );
}
