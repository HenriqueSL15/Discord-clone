import { useParticipants } from "@livekit/components-react";

export default function ParticipantsList() {
  const participants = useParticipants();
  return (
    <div className="flex gap-3">
      {participants.map((p, i) => {
        return (
          <div
            className={`w-20 h-20 bg-black rounded-full flex items-center justify-center ${p.isSpeaking && "border-4 border-emerald-500"}`}
            key={i}
          >
            <h1 className="text-zinc-200 text-4xl">{p.identity}</h1>
          </div>
        );
      })}
    </div>
  );
}
