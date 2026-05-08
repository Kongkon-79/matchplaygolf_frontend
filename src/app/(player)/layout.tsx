import DashboardAccessGuard from "@/components/auth/dashboard-access-guard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./_components/shared/app-sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAccessGuard>
      <div>
        <SidebarProvider defaultOpen={true}>
          <div style={{ "--sidebar-width": "300px" } as React.CSSProperties}>
            <AppSidebar />
          </div>
          <main className="w-full">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
            <div className="w-full">
              <div className="pb-10 bg-[#f8f9fa] min-h-screen">{children}</div>
            </div>
          </main>
        </SidebarProvider>
      </div>
    </DashboardAccessGuard>
  );
}
