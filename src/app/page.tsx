import { redirect } from "next/navigation";
import { getUserFriendships, getUserInfo } from "./actions/auth";
import FriendsButton from "./components/Sidebar/FriendsButton";
import FriendsList from "./components/Sidebar/FriendsList";
import UserInfo from "./components/UserInfo";
import SelectedPage from "./components/SelectedPage";

export default async function Home() {
  const user = await getUserInfo();
  if (!user) {
    redirect("/login");
  }

  let friendships = await getUserFriendships();
  if (!friendships) {
    friendships = null;
  }

  return (
    <div className="flex h-screen">
      <div className="bg-[#16181d]/95 w-1/5 flex flex-col  p-3">
        <FriendsButton />
        <FriendsList friendships={friendships} />
        <UserInfo />
      </div>
      <SelectedPage />
    </div>
  );
}
