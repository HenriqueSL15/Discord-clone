import { Phone } from "lucide-react";

export default function TopBar({
  otherUserId,
  startCall,
}: {
  otherUserId: string;
  startCall: (targetUserId: string) => void;
}) {
  return (
    <div className="h-1/15 w-full flex items-center justify-end px-5 border-b border-zinc-700">
      <Phone
        className="text-zinc-300 hover:text-zinc-200 transition-all cursor-pointer"
        onClick={() => startCall(otherUserId)}
      />
    </div>
  );
}
