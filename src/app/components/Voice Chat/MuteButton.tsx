import { useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff } from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";
import { useEffect } from "react";
import { toast } from "sonner";

export default function MuteButton() {
  const isMuted = useUserStore((state) => state.isMuted);
  const setIsMuted = useUserStore((state) => state.setIsMuted);
  const { localParticipant } = useLocalParticipant();

  const checkForMicrophone = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphone = devices.filter(
        (device) => device.kind === "audioinput",
      );

      if (microphone.length > 0) {
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error accessing devices:", err);
      return false;
    }
  };

  const toggleMute = async () => {
    const enabled = !isMuted;
    const micExists = await checkForMicrophone();

    if (!micExists) {
      toast.error("Seu dispotivo não possui um microfone");
      return;
    }
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
