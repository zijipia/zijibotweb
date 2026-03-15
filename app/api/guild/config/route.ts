import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import {
  getBotUserGuilds,
  checkBotServerAdmin,
} from "@/lib/bot-api";
import {
  getOrCreateGuildConfig,
  updateGuildConfig,
} from "@/lib/guild-api";

/**
 * GET /api/guild/config
 * Fetch ZiGuild configuration for a specific guild
 * Query: guildId (required)
 */
export async function GET(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      return NextResponse.json(
        { error: "guildId is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this guild
    const guilds = await getBotUserGuilds(authData.id);
    const hasAccess = guilds.some((g: any) => g.id === guildId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this guild" },
        { status: 403 }
      );
    }

    // Get or create guild config
    const config = await getOrCreateGuildConfig(guildId);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("[v0] Guild config GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/guild/config
 * Update ZiGuild configuration for a specific guild
 * Body: { guildId, config: ZiGuildConfig }
 */
export async function PUT(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guildId, config } = body;

    if (!guildId) {
      return NextResponse.json(
        { error: "guildId is required" },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: "config is required" },
        { status: 400 }
      );
    }

    // Verify user is guild owner/admin
    const isAdmin = await checkBotServerAdmin(authData.id, guildId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "You must be guild owner to modify config" },
        { status: 403 }
      );
    }

    // Update guild config
    const updatedConfig = await updateGuildConfig(guildId, config);

    if (!updatedConfig) {
      return NextResponse.json(
        { error: "Failed to update guild config" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Guild config updated successfully",
      data: updatedConfig,
    });
  } catch (error) {
    console.error("[v0] Guild config PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
