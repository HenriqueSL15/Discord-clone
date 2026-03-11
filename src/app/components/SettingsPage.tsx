"use client";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";

import { Eye, EyeClosed } from "lucide-react";

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);

  const [showPreviousPassword, setShowPreviousPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <div className="flex flex-col gap-10 p-5 text-zinc-200">
      <h1 className="text-3xl font-semibold">Configurações</h1>

      <form className="gap-10 flex flex-col">
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="font-medium text-lg">
            Nome de usuário
          </label>
          <input
            name="username"
            type="text"
            placeholder="Digite o novo nome"
            defaultValue={user?.username}
            className="border border-zinc-700 p-2 focus:ring-2 focus:ring-offset-4 focus:ring-offset-zinc-900 outline-0 rounded-lg max-w-1/2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-medium text-lg">
            Email
          </label>
          <input
            name="email"
            type="text"
            placeholder="Digite o novo email"
            defaultValue={user?.email}
            className="border border-zinc-700 p-2 outline-0 rounded-lg max-w-1/2 focus:ring-2 focus:ring-offset-4 focus:ring-offset-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-lg">Senha</label>
          <div className="flex flex-col gap-3">
            <div className="relative max-w-1/2">
              <input
                name="previousPassword"
                type={showPreviousPassword ? "text" : "password"}
                placeholder="Digite a antiga senha"
                className="border border-zinc-700 p-2 outline-0 rounded-lg w-full focus:ring-2 focus:ring-offset-4 focus:ring-offset-zinc-900"
              />
              {showPreviousPassword ? (
                <Eye
                  onClick={() => {
                    setShowPreviousPassword(false);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1"
                />
              ) : (
                <EyeClosed
                  onClick={() => {
                    setShowPreviousPassword(true);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1"
                />
              )}
            </div>
            <div className="relative max-w-1/2">
              <input
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Digite a nova senha"
                className="border border-zinc-700 p-2 outline-0 rounded-lg w-full focus:ring-2 focus:ring-offset-4 focus:ring-offset-zinc-900"
              />
              {showNewPassword ? (
                <Eye
                  onClick={() => {
                    setShowNewPassword(false);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1"
                />
              ) : (
                <EyeClosed
                  onClick={() => {
                    setShowNewPassword(true);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1"
                />
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex justify-center">
          <button
            type="submit"
            className="border border-zinc-400 w-1/4 p-3 rounded-lg"
          >
            Atualizar
          </button>
        </div>
      </form>
    </div>
  );
}
