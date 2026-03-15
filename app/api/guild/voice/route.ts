import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { checkBotServerAdmin } from "@/lib/bot-api";
import { updateVoiceConfig } from "@/lib/guild-api";

/**
 * PUT /api/guild/voice
 * Update voice configuration for a guild
 * Body: { guildId, logMode: boolean }
 */
export async function PUT(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guildId, logMode } = body;

    if (!guildId) {
      return NextResponse.json(
        { error: "guildId is required" },
        { status: 400 }
      );
    }

    if (typeof logMode !== "boolean") {
      return NextResponse.json(
        { error: "logMode must be a boolean" },
        { status: 400 }
      );
    }

    // Verify user is guild admin
    const isAdmin = await checkBotServerAdmin(authData.id, guildId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "You must be guild owner to modify settings" },
        { status: 403 }
      );
    }

    // Update voice config
    const config = await updateVoiceConfig(guildId, { logMode });

    if (!config) {
      return NextResponse.json(
        { error: "Failed to update voice config" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Voice config updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("[v0] Voice config PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
