import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getBotUserGuilds } from "@/lib/bot-api";

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/auth/guilds called");
    const authData = await verifyAuth(request);
    
    if (!authData) {
      console.log("[v0] GET /api/auth/guilds - No auth data");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[v0] GET /api/auth/guilds - Auth verified for user:", authData.id);
    // Get guilds from bot server
    const guilds = await getBotUserGuilds(authData.id);

    console.log("[v0] GET /api/auth/guilds - Returning guilds:", {
      count: guilds.length,
      guildIds: guilds.map((g: any) => g.id),
    });
    return NextResponse.json(guilds);
  } catch (error) {
    console.error("[v0] Get guilds error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
