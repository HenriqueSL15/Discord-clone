"use client";
import { useState, useRef } from "react";
import { useUserStore } from "../store/useUserStore";

import { Eye, EyeClosed, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateUserInformation } from "../actions/auth";
import Image from "next/image";

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [showPreviousPassword, setShowPreviousPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  interface formType {
    username: string;
    email: string;
    previousPassword: string;
    newPassword: string;
    profilePicture: File | string;
  }

  const [formData, setFormData] = useState<formType>({
    username: user?.username ?? "",
    email: user?.email ?? "",
    previousPassword: "",
    newPassword: "",
    profilePicture: "",
  });

  console.log(user);

  return (
    <div className="flex flex-col gap-10 p-5 text-zinc-200 flex-1">
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
        className="flex flex-1 flex-col justify-between"
      >
        <div className="gap-10 flex flex-col">
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

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-picture" className="font-medium text-lg">
              Foto de Perfil
            </label>
            <div className="flex items-start gap-3">
              <button
                className="cursor-pointer"
                onClick={() => profilePictureInputRef.current?.click()}
                type="button"
              >
                <input
                  name="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        profilePicture: e.target.files![0],
                      }));
                    }
                  }}
                  ref={profilePictureInputRef}
                  className="hidden"
                />
                <Plus
                  size={80}
                  className="left-0 top-0 text-[#8b8d93] hover:text-white transition-all border border-zinc-700 p-2 outline-0 rounded-lg"
                />
              </button>
              {formData.profilePicture &&
                typeof formData.profilePicture !== "string" && (
                  <Image
                    src={URL.createObjectURL(formData.profilePicture)}
                    alt="Prévia da imagem de perfil selecionada"
                    width={100}
                    height={100}
                    className="aspect-square rounded-full"
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
