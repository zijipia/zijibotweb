import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { checkBotServerAdmin } from "@/lib/bot-api";
import {
  updateJoinToCreateConfig,
  blockUserFromJoinToCreate,
  unblockUserFromJoinToCreate,
} from "@/lib/guild-api";

/**
 * PUT /api/guild/join-to-create
 * Update join-to-create configuration for a guild
 * Body: { guildId, enabled, voiceChannelId, categoryId, defaultUserLimit }
 */
export async function PUT(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guildId, enabled, voiceChannelId, categoryId, defaultUserLimit } = body;

    if (!guildId) {
      return NextResponse.json(
        { error: "guildId is required" },
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

    // Update join-to-create config
    const config = await updateJoinToCreateConfig(guildId, {
      enabled,
      voiceChannelId: voiceChannelId || null,
      categoryId: categoryId || null,
      defaultUserLimit: defaultUserLimit || 0,
    });

    if (!config) {
      return NextResponse.json(
        { error: "Failed to update join-to-create config" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Join-to-create config updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("[v0] Join-to-create PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guild/join-to-create/block
 * Block a user from join-to-create feature
 * Body: { guildId, userId }
 */
export async function POST(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guildId, userId, action } = body;

    if (!guildId || !userId) {
      return NextResponse.json(
        { error: "guildId and userId are required" },
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

    let config;

    if (action === "block") {
      config = await blockUserFromJoinToCreate(guildId, userId);
    } else if (action === "unblock") {
      config = await unblockUserFromJoinToCreate(guildId, userId);
    } else {
      return NextResponse.json(
        { error: "action must be 'block' or 'unblock'" },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: `Failed to ${action} user from join-to-create` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action === 'block' ? 'blocked' : 'unblocked'} successfully`,
      data: config,
    });
  } catch (error) {
    console.error("[v0] Join-to-create block/unblock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
