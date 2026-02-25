"use client";
import { LiveKitRoom } from "@livekit/components-react";
import AudioChatInterface from "./AudioChatInterface";
import { useUserStore } from "../store/useUserStore";

export default function AudioChat() {
  const voiceChatToken = useUserStore((state) => state.voiceChatToken);

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={voiceChatToken}
      connect={true}
      audio={true}
      video={false}
    >
      <div className="flex flex-col items-center gap-4 p-8 border rounded-lg">
        <h2 className="text-xl font-bold">Chamada começou</h2>
        <AudioChatInterface />
      </div>
    </LiveKitRoom>
  );
}
