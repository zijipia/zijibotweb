import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface AuthData {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  guilds: Array<{
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: string;
  }>;
  iat?: number;
  exp?: number;
}

export async function verifyAuth(request: NextRequest): Promise<AuthData | null> {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET!
    ) as AuthData;

    return decoded;
  } catch (error) {
    console.error("[v0] Auth verification error:", error);
    return null;
  }
}

export function getLoginUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI!
  );
  const scopes = encodeURIComponent("identify guilds");

  return `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;
}
