import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { verifyAuth } from "@/lib/auth";
import { getServerConfig, updateServerConfig } from "@/lib/mongodb";

// GET - Fetch server config
export async function GET(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return NextResponse.json(
        { error: "serverId is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this server
    const hasAccess = authData.guilds.some((g: any) => g.id === serverId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this server" },
        { status: 403 }
      );
    }

    // Get config from MongoDB
    const config = await getServerConfig(serverId);
    
    // Return existing config or default config
    const defaultConfig = {
      serverId,
      prefix: "!",
      language: "en",
      modRole: null,
      logChannel: null,
      autorole: false,
      autoroleIds: [],
      customCommands: [],
    };

    return NextResponse.json(config || defaultConfig);
  } catch (error) {
    console.error("[v0] Config GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update server config
export async function PUT(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serverId, config } = body;

    if (!serverId) {
      return NextResponse.json(
        { error: "serverId is required" },
        { status: 400 }
      );
    }

    // Check if user is admin on this server
    const serverGuild = authData.guilds.find((g: any) => g.id === serverId);
    if (!serverGuild || !serverGuild.owner) {
      return NextResponse.json(
        { error: "You must be server owner to modify config" },
        { status: 403 }
      );
    }

    // Save config to MongoDB
    const success = await updateServerConfig(serverId, config);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update config" },
        { status: 500 }
      );
    }

    // TODO: Broadcast update via WebSocket to bot server for real-time reload
    // botWS.send('config:updated', { serverId, config });

    return NextResponse.json({
      success: true,
      message: "Config updated successfully",
      config: { serverId, ...config },
    });
  } catch (error) {
    console.error("[v0] Config PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
