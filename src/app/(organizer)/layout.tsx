import DashboardAccessGuard from "@/components/auth/dashboard-access-guard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { OrganizerSidebar } from "./_components/organizer-sidebar";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAccessGuard>
      <div>
        <SidebarProvider defaultOpen={true}>
          <div style={{ "--sidebar-width": "340px" } as React.CSSProperties}>
            <OrganizerSidebar />
          </div>
          <main className="w-full">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
            <div className="w-full">
              <div className="bg-[#F8F9FA] min-h-screen">{children}</div>
            </div>
          </main>
        </SidebarProvider>
      </div>
    </DashboardAccessGuard>
  );
}
