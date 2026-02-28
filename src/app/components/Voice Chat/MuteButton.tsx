import { useLocalParticipant } from "@livekit/components-react";
import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

export default function MuteButton() {
  const { localParticipant } = useLocalParticipant();

  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = async () => {
    console.log("vai funcionar");
    const enabled = !isMuted;
    await localParticipant?.setMicrophoneEnabled(!enabled);
    setIsMuted(enabled);
  };

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
