"use client";
import { PusherListener } from "./PusherListener";
import { ActivityTracker } from "./ActivityTracker";
import { useUserStore } from "../store/useUserStore";

export function PresenceManager() {
  const user = useUserStore((state) => state.user);

  if (!user) return null;

  return (
    <>
      <PusherListener userId={user.id} />
      <ActivityTracker userId={user.id} />
    </>
  );
}
