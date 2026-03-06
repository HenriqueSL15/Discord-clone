import { redirect } from "next/navigation";
import { getUserFriendships, getUserInfo } from "./actions/auth";
import MainContainer from "./components/MainContainer";

export default async function Home() {
  const user = await getUserInfo();
  if (!user) {
    redirect("/login");
  }

  let friendships = await getUserFriendships();
  if (!friendships) {
    friendships = null;
  }

  return <MainContainer friendships={friendships} />;
}
