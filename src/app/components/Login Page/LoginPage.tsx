"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { useUserStore } from "../../store/useUserStore";

export default function LoginPage() {
  const [isHidden, setIsHidden] = useState(true);
  const router = useRouter();
  const updateUser = useUserStore((state) => state.setUser);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-linear-to-br from-[#202442] to-[#121317]">
      <div className="bg-[#16181d] min-h-1/2 min-w-3/10 shadow-xl rounded-lg flex flex-col items-center text-center">
        <h1 className="m-8 font-bold text-white text-xl">Discord Clone</h1>
        <div className="mb-3 flex flex-col">
          <h1 className="text-white font-bold text-2xl">
            Boas-vindas de volta!
          </h1>
          <h2 className="text-[#6a87a3] ">
            Estamos muito animados em te ver novamente!
          </h2>
        </div>
        <form
          action={async (formData) => {
            const res = await login(formData);

            if ("error" in res) {
              console.log("HOUVE UM ERRO NO LOGIN");
            } else {
              updateUser(res);
              router.push("/");
            }
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
            Entrar
          </button>
          <h2 className="text-[#657d9e] mb-5">
            Precisando de uma conta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="hover:cursor-pointer text-[#5664ef] hover:border-b"
            >
              Registre-se
            </button>
          </h2>
        </form>
      </div>
    </div>
  );
}
