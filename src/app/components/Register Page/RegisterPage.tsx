"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const [isHidden, setIsHidden] = useState(true);
  const router = useRouter();

  return (
    <div className="w-full h-screen flex justify-center items-center bg-linear-to-br from-[#202442] to-[#121317]">
      <div className="bg-[#16181d] min-h-1/2 min-w-3/10 shadow-xl rounded-lg flex flex-col items-center text-center">
        <h1 className="m-8 font-bold text-white text-xl">Discord Clone</h1>
        <div className="mb-3 flex flex-col">
          <h1 className="text-white font-bold text-2xl">Cria uma conta!</h1>
          <h2 className="text-[#6a87a3] ">Junte-se a nós!</h2>
        </div>
        <form
          action={async (formData) => {
            await register(formData);
          }}
          className="text-start w-[80%] flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-bold text-[#7288a3]">
              E-MAIL <span className="text-[#e3322c] text-lg">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="bg-[#282b33] px-4 py-2 rounded-md outline-none text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-bold text-[#7288a3]"
            >
              NOME DE USUÁRIO <span className="text-[#e3322c] text-lg">*</span>
            </label>
            <input
              type="text"
              name="username"
              className="bg-[#282b33] px-4 py-2 rounded-md outline-none text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-bold text-[#7288a3]"
            >
              SENHA <span className="text-[#e3322c] text-lg">*</span>
            </label>
            <div className="relative">
              <input
                type={isHidden ? "password" : "text"}
                name="password"
                className="bg-[#282b33] px-4 py-2 rounded-md outline-none pr-10 w-full text-white"
                required
              />

              {isHidden ? (
                <Eye
                  onClick={() => setIsHidden(false)}
                  className="absolute right-2 top-2 text-4xl hover:cursor-pointer text-[#67788f] hover:text-white transition-all"
                />
              ) : (
                <EyeOff
                  onClick={() => setIsHidden(true)}
                  className="absolute right-2 top-2 text-4xl hover:cursor-pointer text-[#67788f] hover:text-white transition-all"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-linear-to-r from-[#5b64f2] to-[#7b4aeb] w-full h-5/10 p-3 mt-5 mb-1 rounded-md hover:brightness-120 hover:cursor-pointer transition-all text-white"
          >
            Continuar
          </button>
          <h2 className="text-[#657d9e] mb-5">
            Já tem uma conta?{" "}
            <button
              onClick={() => router.push("/login")}
              className="hover:cursor-pointer text-[#5664ef] hover:border-b"
            >
              Entrar
            </button>
          </h2>
        </form>
      </div>
    </div>
  );
}
