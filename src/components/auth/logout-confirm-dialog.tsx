"use client";

import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface LogoutConfirmDialogProps {
  callbackUrl?: string;
  className?: string;
  iconClassName?: string;
  label?: string;
  variant?: "sidebar" | "menu";
}

export default function LogoutConfirmDialog({
  callbackUrl = "/",
  className,
  iconClassName,
  label = "Log Out",
  variant = "sidebar",
}: LogoutConfirmDialogProps) {
  const handleLogout = async () => {
    toast.success("Logged out successfully")
    await signOut({ callbackUrl });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        "flex items-center gap-2 transition-colors",
        variant === "sidebar" &&
          "font-medium text-red-500 pl-2 mt-5 hover:text-red-600",
        variant === "menu" && "text-primary hover:text-primary/80",
        className,
      )}
    >
      <LogOut className={cn("h-4 w-4", iconClassName)} />
      <span>{label}</span>
    </button>
  );
}
