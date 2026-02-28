import { getUserInfo } from "@/app/actions/auth";
import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const userId = req.nextUrl.searchParams.get("username");

  if (!room || !userId) {
    return NextResponse.json(
      { error: 'Missing "room" or "username" query parameter' },
      { status: 400 },
    );
  }

  const user = await getUserInfo();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: user.username },
  );

  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json({ token: await at.toJwt() });
}
