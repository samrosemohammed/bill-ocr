import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PropsWithChildren } from "react";

const DahboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-full">
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
            </header>
            <main className="min-w-0 flex-1">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
};

export default DahboardLayout;
