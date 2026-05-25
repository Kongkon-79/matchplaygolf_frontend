"use client";
import {
  LayoutDashboard,
  Settings,
  Swords,
  Trophy,
  Users
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
    url: "/organizer",
    icon: LayoutDashboard,
  },
  {
    title: "Tournaments Management",
    url: "/organizer/tournaments-management",
    icon: Trophy,
  },
    {
    title: "Players Management",
    url: "/organizer/players-management",
    icon: Users,
  },
  {
    title: "Matches Management",
    url: "/organizer/matches-management",
    icon: Swords ,
  },
  {
    title: "Settings",
    url: "/organizer/settings",
    icon: Settings,
  },

];

export function OrganizerSidebar() {
  const pathName = usePathname();

  return (
    <Sidebar className="border-none w-[340px]">
      <SidebarContent className="bg-white scrollbar-hide">
        <SidebarGroup className="p-0">
          <div className="flex flex-col justify-between min-h-screen pb-5">
            <div>
              <SidebarGroupLabel className="mt-5 mb-5 h-[80px] flex justify-center">
                <Link href={`/`}>
                  <Image
                    src={`/images/common/organizer-logo.png`}
                    alt="logo"
                    width={1000}
                    height={1000}
                    className="h-[60px] w-auto object-contain"
                  />
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-4 pt-5">
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive =
                      item.url === "/organizer"
                        ? pathName === "/organizer"
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
