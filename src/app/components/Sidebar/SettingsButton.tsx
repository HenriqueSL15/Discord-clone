"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import { logoff } from "../../actions/auth";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsButton() {
  const updateUser = useUserStore((state) => state.setUser);
  const modal = useUserStore((state) => state.modal);
  const setModal = useUserStore((state) => state.setModal);

  const setPage = useUserStore((state) => state.setPage);

  const { x, y, refs, strategy } = useFloating({
    placement: "bottom",
    middleware: [offset(10), flip(), shift()],
  });

  const router = useRouter();

  return (
    <>
      <button
        ref={refs.setReference}
        onClick={(e) => {
          e.stopPropagation();
          const newValue = modal == "settings" ? "" : "settings";
          console.log(newValue);
          setModal(newValue);
        }}
        className="relative rounded-lg transition-all h-2/3 flex items-center justify-center hover:bg-white/10 p-3 cursor-pointer"
      >
        <Settings />
      </button>
      {modal == "settings" && (
        <div
          ref={refs.setFloating}
          className="bg-[#1b1c22] flex items-center justify-center rounded-lg border border-[#16181e] shadow-lg"
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 50,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="text-start flex-col items-start flex gap-2 p-4 font-medium">
            <li
              className="hover:bg-[#62667a]/50 w-full cursor-pointer p-2 rounded-lg transition-all"
              onClick={async () => {
                const res = logoff();

                toast.promise(res, {
                  loading: "Deslogando...",
                  success: () => {
                    router.push("/login");
                    setModal("");
                    setPage("friends");
                    updateUser(null);
                    return "Deslogado";
                  },
                  error: (error) => {
                    return `${error.message}`;
                  },
                });
              }}
            >
              Deslogar
            </li>
            <li
              className="hover:bg-[#62667a]/50 cursor-pointer rounded-lg p-2 transition-all"
              onClick={() => {
                setModal("");
                setPage("settings");
              }}
            >
              Configurações da Conta
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
