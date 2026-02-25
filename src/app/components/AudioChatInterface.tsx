"use client";
import {
  BarVisualizer,
  ControlBar,
  RoomAudioRenderer,
  useParticipants,
} from "@livekit/components-react";
import { X } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { triggerVoiceChatEnd } from "../actions/voice";

export default function AudioChatInterface() {
  const user = useUserStore((state) => state.user);
  const setVoiceChatToken = useUserStore((state) => state.setVoiceChatToken);

  const activeRoom = useUserStore((state) => state.activeRoom);
  const setActiveRoom = useUserStore((state) => state.setActiveRoom);

  const otherUserId = activeRoom.split("---").filter((id) => id != user?.id);

  const participants = useParticipants();

  const isAlone = participants.length == 1;
  return (
    <>
      <BarVisualizer />

      <RoomAudioRenderer />

      <ControlBar
        controls={{ microphone: true, camera: false, screenShare: false }}
      />
      <button
        className="w-15 h-15 rounded-full bg-zinc-800 flex items-center justify-center p-2 hover:bg-zinc-500 transition-all cursor-pointer"
        onClick={() => {
          if (!isAlone) {
            setActiveRoom("");
          } else {
            setActiveRoom("");
            setVoiceChatToken("");
            triggerVoiceChatEnd(otherUserId[0]);
          }
        }}
      >
        <X className="w-full h-full" />
      </button>
    </>
  );
}
