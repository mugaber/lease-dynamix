"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleIcon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/auth";
import { signOut } from "@/app/(login)/actions";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/lib/db/schema";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { userPromise } = useUser();
  const router = useRouter();

  useEffect(() => {
    userPromise.then(setUser);
  }, [userPromise]);

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push("/");
  }

  const getLogoRoute = () => {
    if (user) {
      return "/dashboard/home";
    }
    return "/";
  };

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href={getLogoRoute()} className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">
            Lease Dynamix
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer size-9 bg-orange-500">
                  <AvatarImage alt={user.name || ""} />
                  <AvatarFallback>
                    {(user.name || user.email)
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex flex-col gap-1">
                <form action={handleSignOut} className="w-full">
                  <button type="submit" className="flex w-full">
                    <DropdownMenuItem className="w-full flex-1 cursor-pointer hover:bg-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Pricing
              </Link>
              <Button
                asChild
                className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname.includes("editor");

  return (
    <section className="flex flex-col min-h-screen">
      {!hideHeader && <Header />}
      {children}
    </section>
  );
}
