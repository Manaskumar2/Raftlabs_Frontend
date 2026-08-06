"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { ShoppingCart, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function Navbar() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent hover:text-accent-foreground" />
              }
            >
              <MenuIcon className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-background/95 backdrop-blur-xl border-r-border/50">
              <nav className="flex flex-col gap-6 mt-12">
                <Link href="/menu" className="text-xl font-medium hover:text-primary transition-colors">Menu</Link>
                <Link href="/orders" className="text-xl font-medium hover:text-primary transition-colors">My Orders</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <span className="font-extrabold text-2xl hidden md:inline-block bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              RaftLabs
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full hover:bg-accent"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Link href="/orders" className="hidden sm:block">
            <Button variant="ghost" className="rounded-full font-medium">
              My Orders
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="default" className="rounded-full gap-2 px-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline-block">Cart</span>
              {totalItems > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
