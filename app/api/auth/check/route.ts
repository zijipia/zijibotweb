import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("[v0] Auth check error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
