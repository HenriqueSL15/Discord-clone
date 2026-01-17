"use client";

import { useEffect, useRef } from "react";
import { updateOnlineStatus } from "../actions/auth";
import { useUserStore } from "../store/useUserStore";

export function ActivityTracker({ userId }: { userId: string }) {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStatus = useRef<"ONLINE" | "ABSENT">("ONLINE");

  const updateStatus = async (status: "ONLINE" | "ABSENT") => {
    if (currentStatus.current == status) return;

    currentStatus.current = status;

    if (user) {
      setUser({ ...user, onlineStatus: status });
    }

    await updateOnlineStatus(userId, status);
  };

  const resetTimer = () => {
    if (currentStatus.current === "ABSENT") {
      updateStatus("ONLINE");
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      updateStatus("ABSENT");
    }, 300000);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, []);

  return null;
}
