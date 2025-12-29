import { redirect } from "next/navigation";
import { getUserInfo } from "./actions/auth";
import FriendsButton from "./components/FriendsButton";
import FriendsList from "./components/FriendsList";
import UserInfo from "./components/UserInfo";
import SelectedPage from "./components/SelectedPage";

export default async function Home() {
  const user = await getUserInfo();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <div className="bg-[#16181d]/95 w-1/5 flex flex-col  p-3">
        <FriendsButton />
        <FriendsList />
        <UserInfo />
      </div>
      <SelectedPage />
    </div>
  );
}
