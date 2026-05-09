"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import LogoutConfirmDialog from "@/components/auth/logout-confirm-dialog";

const NavDropdown = () => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const session = useSession();
  const token = session?.data?.user?.accessToken;
  const role = session?.data?.user?.role;

  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      return data?.data;
    },
  });

  return (
    <div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="focus-visible:outline-none">
          <div className="h-12 w-12 rounded-full">
            <Image
              src={data?.profileImage || "/images/common/user_placeholder.png"}
              alt="img.png"
              width={1000}
              height={1000}
              className="h-full w-full object-cover rounded-full"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel className="text-xl">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={role === "User" ? "/player" : "/organizer"}
              className="font-medium flex items-center gap-1"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href={
                role === "User" ? "/player/settings" : "/organizer/settings"
              }
              className="font-medium flex items-center gap-1"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsLogoutOpen(true);
            }}
            className="cursor-pointer"
          >
            <div className="font-medium flex items-center gap-1 text-primary hover:text-primary/80">
              Log Out
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog
        callbackUrl="/"
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        hideTrigger
      />
    </div>
  );
};

export default NavDropdown;
