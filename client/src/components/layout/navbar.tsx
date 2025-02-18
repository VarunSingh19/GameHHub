import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LogOut, Trophy, User, Gamepad, Home } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Gamepad className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              GameHub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center transition-colors hover:text-foreground/80 ${
                  location === href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
