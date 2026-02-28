import { useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff } from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";
import { useEffect } from "react";

export default function MuteButton() {
  const isMuted = useUserStore((state) => state.isMuted);
  const setIsMuted = useUserStore((state) => state.setIsMuted);
  const { localParticipant } = useLocalParticipant();

  const toggleMute = async () => {
    const enabled = !isMuted;
    await localParticipant?.setMicrophoneEnabled(!enabled);
    setIsMuted(enabled);
  };

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!isMuted);
    }
  }, [isMuted]);

  return (
    <button
      className={`${isMuted ? "bg-red-800 hover:bg-red-500" : "bg-emerald-800 hover:bg-emerald-500"} h-15 w-15 px-2 flex items-center justify-center rounded-full cursor-pointer transition-all`}
      onClick={toggleMute}
    >
      {isMuted ? (
        <MicOff className="w-full h-full" />
      ) : (
        <Mic className="w-full h-full" />
      )}
    </button>
  );
}
