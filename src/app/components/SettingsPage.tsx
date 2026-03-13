"use client";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";

import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { updateUserInformation } from "../actions/auth";

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [showPreviousPassword, setShowPreviousPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    previousPassword: "",
    newPassword: "",
  });

  return (
    <div className="flex flex-col gap-10 p-5 text-zinc-200">
      <h1 className="text-3xl font-semibold">Configurações</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(updateUserInformation(formData), {
            loading: "Atualizando...",
            success: (data) => {
              setUser(data);

              return "Informações atualizadas com sucesso";
            },
            error: (err) => {
              return err.message;
            },
          });
        }}
        className="gap-10 flex flex-col"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="font-medium text-lg">
            Nome de usuário
          </label>
          <input
            name="username"
            type="text"
            placeholder="Digite o novo nome"
            value={formData.username}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, username: e.target.value }))
            }
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
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
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
                value={formData.previousPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    previousPassword: e.target.value,
                  }))
                }
                className="border border-zinc-700 p-2 outline-0 rounded-lg w-full focus:ring-2 focus:ring-offset-4 focus:ring-offset-zinc-900"
              />
              {showPreviousPassword ? (
                <Eye
                  onClick={() => {
                    setShowPreviousPassword(false);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1 cursor-pointer"
                />
              ) : (
                <EyeClosed
                  onClick={() => {
                    setShowPreviousPassword(true);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1 cursor-pointer"
                />
              )}
            </div>
            <div className="relative max-w-1/2">
              <input
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Digite a nova senha"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="border border-zinc-700 p-2 outline-0 rounded-lg w-full focus:ring-2 focus:ring-offset-4 focus:ring-offset-zinc-900"
              />
              {showNewPassword ? (
                <Eye
                  onClick={() => {
                    setShowNewPassword(false);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1 cursor-pointer"
                />
              ) : (
                <EyeClosed
                  onClick={() => {
                    setShowNewPassword(true);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1 cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex justify-center">
          <button
            type="submit"
            className="border border-zinc-400 w-1/4 p-3 rounded-lg cursor-pointer"
          >
            Atualizar
          </button>
        </div>
      </form>
    </div>
  );
}
