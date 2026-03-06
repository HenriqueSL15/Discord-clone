import { Menu, Phone } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

export default function TopBar({
  otherUserId,
  startCall,
}: {
  otherUserId: string;
  startCall: (targetUserId: string) => void;
}) {
  const setSidebarOpen = useUserStore((state) => state.setSidebarOpen);

  return (
    <div className="h-13 w-full flex items-center justify-between px-5 border-b border-zinc-700">
      <div className="flex items-center gap-3">
        <Menu
          className="md:hidden text-zinc-300 hover:text-zinc-200 transition-all cursor-pointer"
          onClick={() => setSidebarOpen(true)}
        />
      </div>
      <Phone
        className="text-zinc-300 hover:text-zinc-200 transition-all cursor-pointer"
        onClick={() => startCall(otherUserId)}
      />
    </div>
  );
}
