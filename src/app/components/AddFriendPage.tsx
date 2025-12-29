import { Dispatch, SetStateAction } from "react";

export default function AddFriendPage({
  search,
  setSearch,
  handleAddFriend,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  handleAddFriend: (formData: FormData) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-white font-bold text-xl">Adicionar Amigo</h1>
        <h2 className="text-[#5c7ca0] font-semibold">
          Você pode adicionar amigos com o nome de usuário deles.
        </h2>
      </div>
      <form action={handleAddFriend} className="flex gap-3">
        <input
          type="text"
          name="searchInput"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="bg-[#121317] px-3 py-2 rounded-lg text-[#5c7ca0] font-semibold w-1/2 outline-none"
        />
        <button
          type="submit"
          className="bg-linear-to-r from-[#5b64f2] to-[#7b4aeb] w-1/4 font-semibold h-5/10 p-3 mb-1 rounded-md hover:brightness-120 hover:cursor-pointer transition-all text-white"
        >
          Mandar Solicitação de Amizade
        </button>
      </form>
    </div>
  );
}
