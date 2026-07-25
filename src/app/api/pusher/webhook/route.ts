import { NextResponse } from "next/server";
import { updateOnlineStatus } from "@/app/actions/auth";

export async function GET(req: Request) {
  return NextResponse.json({ message: "OK" }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();

  for (const event of body.events) {
    if (event.name === "channel_vacated") {
      const userId = event.channel.slice(5) as string;

      await updateOnlineStatus("OFFLINE", userId);
    }
  }

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
