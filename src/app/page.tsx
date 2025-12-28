import { redirect } from "next/navigation";
import { getUserInfo } from "./actions/auth";
import FriendsButton from "./components/FriendsButton";
import UserInfo from "./components/UserInfo";

export default async function Home() {
  const user = await getUserInfo();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <div className="bg-[#121317]/95 w-1/5 flex flex-col justify-between p-3">
        <FriendsButton />
        {/* <FriendsList /> */}
        <UserInfo />
      </div>
    </div>
  );
}
