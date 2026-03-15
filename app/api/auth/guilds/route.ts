import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getUserGuilds } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get guilds from MongoDB instead of JWT to avoid cookie size limits
    const guilds = await getUserGuilds(authData.id);

    return NextResponse.json(guilds);
  } catch (error) {
    console.error("[v0] Get guilds error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
