"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  if (!pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-background/40 backdrop-blur-md pt-6 relative h-full">
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-[1.02]"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
