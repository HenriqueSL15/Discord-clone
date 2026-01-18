import { NextResponse } from "next/server";
import { updateOnlineStatus } from "@/app/actions/auth";

export async function POST(req: Request) {
  const body = await req.json();

  for (const event of body.events) {
    if (event.name === "channel_vacated") {
      const channelName = event.channel;

      const userId = channelName.replace("private-user-", "");

      await updateOnlineStatus(userId, "OFFLINE");
    }
  }

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
