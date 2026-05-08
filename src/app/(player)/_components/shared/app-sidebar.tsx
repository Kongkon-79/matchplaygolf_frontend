"use client";
import {
  BookAudio,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutConfirmDialog from "@/components/auth/logout-confirm-dialog";

const items = [
  {
    title: "Dashboard Overview",
    url: "/player",
    icon: LayoutDashboard,
  },
  {
    title: "Match Schedule",
    url: "/player/match-schedule",
    icon: BookAudio,
  },
  {
    title: "Settings",
    url: "/player/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathName = usePathname();

  return (
    <Sidebar className="border-none w-[300px]">
      <SidebarContent className="bg-white scrollbar-hide">
        <SidebarGroup className="p-0">
          <div className="flex flex-col justify-between min-h-screen pb-5">
            <div>
              <SidebarGroupLabel className="mt-5 mb-5 h-[80px] flex justify-center">
                <Link href={`/`}>
                  <Image
                    src={`/images/common/logo.png`}
                    alt="logo.png"
                    width={1000}
                    height={1000}
                    className="h-[60px] w-[170px] object-cover"
                  />
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-4">
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive =
                      item.url === "/player"
                        ? pathName === "/player"
                        : pathName === item.url ||
                          pathName.startsWith(`${item.url}/`);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          className={`h-[60px] rounded-none text-[20px] text-primary hover:bg-[#f8f9fa] hover:text-primary transition-all duration-300 ${
                            isActive &&
                            "bg-[#f8f9fa] hover:bg-[#f8f9fa] text-primary shadow-[0px_4px_6px_0px_#DF10201A] hover:text-primary hover:shadow-[0px_4px_6px_0px_#DF10201A] font-medium"
                          }`}
                          asChild
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </div>

            <div>
              <SidebarFooter className="border-t border-gray-300">
                <LogoutConfirmDialog callbackUrl="/" label="Log out" />
              </SidebarFooter>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
