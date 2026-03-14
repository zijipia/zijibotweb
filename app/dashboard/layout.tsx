import { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/nav";

export const metadata = {
  title: "Dashboard - Bot Configuration",
  description: "Manage your bot settings",
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex">
        <DashboardNav />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
