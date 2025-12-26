"use client";

import { useState } from "react";

export default function IconButton({ icon, action }) {
  const FirstIcon = icon?.[0];
  const SecondIcon = icon?.[1] ? icon[1] : icon[0];

  const [clicked, setClicked] = useState(false);

  return (
    <button
      onClick={() => setClicked((prev) => !prev)}
      className="rounded-lg transition-all h-2/3 flex items-center justify-center hover:bg-white/10 p-3 cursor-pointer"
    >
      {action != "userSettings" ? (
        !clicked ? (
          <FirstIcon />
        ) : (
          <SecondIcon color="red" />
        )
      ) : (
        <FirstIcon />
      )}
    </button>
  );
}
