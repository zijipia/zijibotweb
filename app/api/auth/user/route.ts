import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: authData.id,
      username: authData.username,
      discriminator: authData.discriminator,
      avatar: authData.avatar,
      email: authData.email,
    });
  } catch (error) {
    console.error("[v0] Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
