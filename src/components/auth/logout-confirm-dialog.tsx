"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import React, { useState } from "react";

interface LogoutConfirmDialogProps {
  callbackUrl?: string;
  className?: string;
  iconClassName?: string;
  label?: string;
  variant?: "sidebar" | "menu";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export default function LogoutConfirmDialog({
  callbackUrl = "/",
  className,
  iconClassName,
  label = "Log Out",
  variant = "sidebar",
  open,
  onOpenChange,
  hideTrigger = false,
}: LogoutConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <button
            type="button"
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
        </DialogTrigger>
      )}

      <DialogContent className="max-w-md rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl">
        <DialogHeader className="space-y-0 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Confirm Logout
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          <DialogDescription className="text-base leading-7 text-gray-600">
            Are you sure you want to log out? You&apos;ll need to sign in again
            to access your account.
          </DialogDescription>
        </div>

        <DialogFooter className="border-t border-gray-100 px-6 py-5">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-[#E53E3E] px-4 py-2 font-medium text-white transition-colors hover:bg-[#cc3232]"
          >
            Log Out
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
