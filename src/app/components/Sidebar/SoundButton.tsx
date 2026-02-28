"use client";

import { useState } from "react";
import { Headphones, Volume2 } from "lucide-react";
export default function SoundButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setClicked((prev) => !prev);
        }}
        className="relative rounded-lg transition-all h-2/3 flex items-center justify-center hover:bg-white/10 p-3 cursor-pointer"
      >
        {clicked ? <Volume2 /> : <Headphones />}
      </button>
    </>
  );
}
