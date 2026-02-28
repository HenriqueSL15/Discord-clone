"use client";

import { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import { logoff } from "../../actions/auth";
import { Settings } from "lucide-react";

export default function SettingsButton() {
  const setModal = useUserStore((state) => state.setModal);

  const [clicked, setClicked] = useState(false);
  const { x, y, refs, strategy } = useFloating({
    placement: "bottom",
    middleware: [offset(10), flip(), shift()],
  });

  return (
    <>
      <button
        ref={refs.setReference}
        onClick={() => {
          setClicked((prev) => !prev);

          setModal("settings");
        }}
        className="relative rounded-lg transition-all h-2/3 flex items-center justify-center hover:bg-white/10 p-3 cursor-pointer"
      >
        <Settings />
      </button>
      {clicked && (
        <div
          ref={refs.setFloating}
          className="w-20 h-20 bg-[#1b1c22] flex items-center justify-center rounded-lg p-5"
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 50,
          }}
        >
          <ul>
            <li
              className="hover:bg-[#62667a]/50 cursor-pointer rounded-lg p-1 transition-all"
              onClick={async () => await logoff()}
            >
              Deslogar
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
