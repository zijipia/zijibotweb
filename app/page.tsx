import { getLoginUrl } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Bot Configuration Dashboard",
  description: "Manage your bot settings with ease",
};

export default function Home() {
  const loginUrl = getLoginUrl();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md px-4">
        <Card className="border-slate-700 bg-slate-800">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Bot Dashboard
              </h1>
              <p className="text-slate-400">
                Manage your bot configuration and settings
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Easy Configuration</p>
                  <p className="text-sm text-slate-400">
                    Update bot settings in real-time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Multi-Server Support</p>
                  <p className="text-sm text-slate-400">
                    Manage multiple servers from one place
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Admin Controls</p>
                  <p className="text-sm text-slate-400">
                    Full control for server owners
                  </p>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <a href={loginUrl} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg font-semibold">
                Login with Discord
              </Button>
            </a>

            {/* Footer */}
            <p className="text-center text-xs text-slate-500 mt-6">
              This application requires Discord authentication and access to your server information.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
