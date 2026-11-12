"use client";

import { useState } from "react";
import { ShieldCheck, User } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type { MenuUser } from "@/components/user-menu";
import { AccountSettings } from "@/app/dashboard/_components/account-settings";
import { SecuritySettings } from "@/app/dashboard/_components/security-settings";
import { ScrollArea } from "./ui/scroll-area";

const SECTIONS = [
  { id: "account", title: "Account", icon: User },
  { id: "security", title: "Security", icon: ShieldCheck },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SettingsDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: MenuUser;
}) {
  const [active, setActive] = useState<SectionId>("account");
  const current = SECTIONS.find((s) => s.id === active)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your account and security settings.
        </DialogDescription>

        <SidebarProvider className="min-h-0 items-start">
          {/* Desktop: section list on the left */}
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {SECTIONS.map((section) => (
                      <SidebarMenuItem key={section.id}>
                        <SidebarMenuButton
                          isActive={section.id === active}
                          onClick={() => setActive(section.id)}
                        >
                          <section.icon />
                          <span>{section.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex h-[480px] min-w-0 flex-1 flex-col overflow-hidden">
            {/* Mobile: section buttons on top */}
            <div className="flex gap-1 border-b p-2 pr-12 md:hidden">
              {SECTIONS.map((section) => (
                <Button
                  key={section.id}
                  variant={section.id === active ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActive(section.id)}
                >
                  <section.icon />
                  {section.title}
                </Button>
              ))}
            </div>

            <header className="flex h-14 shrink-0 items-center px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    Settings
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{current.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <ScrollArea className="min-h-0 flex-1">
              <div className="p-4 pt-0">
                {active === "account" && <AccountSettings user={user} />}
                {active === "security" && <SecuritySettings />}
              </div>
            </ScrollArea>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
