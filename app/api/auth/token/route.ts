import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import jwt from "jsonwebtoken";

/**
 * GET /api/auth/token
 * Returns a JWT token that client can use to authenticate with bot API
 * This avoids Cloudflare blocking server-side requests
 */
export async function GET(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a signed token for client to use with bot API
    const clientToken = jwt.sign(
      {
        userId: authData.id,
        username: authData.username,
        type: "client",
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1h" } // Short-lived token for client use
    );

    return NextResponse.json({
      success: true,
      token: clientToken,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("[v0] Get token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
