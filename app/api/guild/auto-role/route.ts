import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { checkBotServerAdmin } from "@/lib/bot-api";
import { updateAutoRoleConfig } from "@/lib/guild-api";

/**
 * PUT /api/guild/auto-role
 * Update auto-role configuration for a guild
 * Body: { guildId, enabled, roleIds: string[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guildId, enabled, roleIds } = body;

    if (!guildId) {
      return NextResponse.json(
        { error: "guildId is required" },
        { status: 400 }
      );
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 }
      );
    }

    if (!Array.isArray(roleIds)) {
      return NextResponse.json(
        { error: "roleIds must be an array" },
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

    // Update auto-role config
    const config = await updateAutoRoleConfig(guildId, {
      enabled,
      roleIds,
    });

    if (!config) {
      return NextResponse.json(
        { error: "Failed to update auto-role config" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Auto-role config updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("[v0] Auto-role PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
