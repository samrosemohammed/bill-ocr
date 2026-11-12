"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { SettingsDialog } from "./security-settings";
import { ConfirmDialog } from "./confirm-dialog";

export type MenuUser = {
  name: string;
  email: string;
  image?: string | null;
};

// Either a link (href) or an action (onSelect)
type MenuItem = {
  id: string;
  title: string;
  icon: LucideIcon;
  href?: string;
  onSelect?: () => void;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

function UserAvatar({
  user,
  className,
}: {
  user: MenuUser;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {user.image && (
        <AvatarImage
          src={user.image}
          alt={user.name}
          referrerPolicy="no-referrer"
        />
      )}
      <AvatarFallback className="rounded-lg">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function MenuItems({
  user,
  items,
  onSignOut,
}: {
  user: MenuUser;
  items: MenuItem[];
  onSignOut: () => void;
}) {
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="flex items-center gap-2 p-2 font-normal">
          <UserAvatar user={user} className="size-8 rounded-lg" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            render={item.href ? <Link href={item.href} /> : undefined}
            onClick={item.onSelect}
          >
            <item.icon />
            {item.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={onSignOut}>
        <LogOut />
        Sign out
      </DropdownMenuItem>
    </>
  );
}

function SidebarUserMenu({
  user,
  items,
  onSignOut,
}: {
  user: MenuUser;
  items: MenuItem[];
  onSignOut: () => void;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
            <UserAvatar user={user} className="size-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <MenuItems user={user} items={items} onSignOut={onSignOut} />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function HeaderUserMenu({
  user,
  items,
  onSignOut,
}: {
  user: MenuUser;
  items: MenuItem[];
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Open user menu"
          />
        }
      >
        <UserAvatar user={user} className="size-8" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="end" sideOffset={8}>
        <MenuItems user={user} items={items} onSignOut={onSignOut} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu({
  user,
  variant,
}: {
  user: MenuUser;
  variant: "sidebar" | "header";
}) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
        onError: () => {
          setSigningOut(false);
          setSignOutOpen(false);
        },
      },
    });
  };
  // Add future items here
  const items: MenuItem[] = [
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      onSelect: () => setSettingsOpen(true),
    },
  ];

  const openSignOut = () => setSignOutOpen(true);

  return (
    <>
      {variant === "sidebar" ? (
        <SidebarUserMenu user={user} items={items} onSignOut={openSignOut} />
      ) : (
        <HeaderUserMenu user={user} items={items} onSignOut={openSignOut} />
      )}
      {/* Outside the dropdown, so it doesn't unmount when the menu closes */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
      />
      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You'll need to sign in again to access your account."
        confirmLabel="Sign out"
        pendingLabel="Signing out…"
        keepOpenOnSuccess
        onConfirm={handleSignOut}
      />
    </>
  );
}
