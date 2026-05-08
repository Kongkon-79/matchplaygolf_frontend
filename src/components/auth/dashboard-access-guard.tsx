"use client";

import { isAdminRole } from "@/lib/role-utils";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function DashboardAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    if (!isAdminRole(session?.user?.role)) return;

    if (!hasShownToast.current) {
      hasShownToast.current = true;

      const isSettingsPage = pathname?.includes("/settings");
      toast.error(
        isSettingsPage
          ? "Admin cannot access website settings."
          : "Admin cannot access this website dashboard."
      );
    }

    router.replace("/");
  }, [pathname, router, session?.user?.role, status]);

  if (status === "authenticated" && isAdminRole(session?.user?.role)) {
    return null;
  }

  return <>{children}</>;
}
