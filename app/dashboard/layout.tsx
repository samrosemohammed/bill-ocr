import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserMenu } from "@/components/user-menu";
import { requireUser } from "@/lib/session";
import { PropsWithChildren } from "react";

// Authentication reads request headers, so this user-specific layout is allowed
// to wait for request-time data instead of being validated as instant.
export const instant = false;

const DahboardLayout = async ({ children }: PropsWithChildren) => {
  const user = await requireUser();

  const menuUser = { name: user.name, email: user.email, image: user.image };

  return (
    <div className="min-h-full">
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar user={menuUser} />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <div className="ml-auto">
                <UserMenu user={menuUser} variant="header" />
              </div>
            </header>
            <main className="min-w-0 flex-1">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
};

export default DahboardLayout;
