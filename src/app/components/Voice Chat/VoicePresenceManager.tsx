"use client";
import { useLocalParticipant } from "@livekit/components-react";
import { useEffect } from "react";
import { useUserStore } from "@/app/store/useUserStore";

export default function VoicePresenceManager() {
  const { localParticipant } = useLocalParticipant();

  const isMuted = useUserStore((state) => state.isMuted);

  useEffect(() => {
    if (localParticipant.isMicrophoneEnabled === isMuted) {
      localParticipant.setMicrophoneEnabled(!isMuted);
    }
  }, [isMuted, localParticipant]);

  return null;
}
