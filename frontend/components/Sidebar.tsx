"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  LayoutGrid,
  Puzzle,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const mainNavItems: SidebarItem[] = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: LayoutGrid, label: "Projects", href: "/projects" },
  { icon: Puzzle, label: "Integrations", href: "/home/integrations" },
  { icon: BookOpen, label: "Docs", href: "/home/docs" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await fetch(`${API_URL}/api/auth/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      router.push("/");
    }
  };

  return (
    <aside className="h-screen bg-white border-r border-border flex flex-col shrink-0 w-56">
      {/* Logo Section */}
      <div className="p-4 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center overflow-hidden relative">
            <Image 
              src="/logo.png" 
              alt="Hydra" 
              width={40}
              height={40}
              className="object-contain p-0.5"
              style={{ transform: 'rotate(-15deg)' }}
              unoptimized
            />
          </div>
          <span className="font-bold text-xl text-foreground">HYDRA</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col">
        {/* Main Navigation */}
        <div className="px-2 flex-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/home" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg mb-2 px-2 py-1.5 transition-colors group ${
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`text-sm whitespace-nowrap ml-3 ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="px-2 mt-auto mb-4">
          <div className="border-t border-border mb-2"></div>
          <Link
            href="/home/settings"
            className={`flex items-center rounded-lg px-2 py-1.5 mb-2 transition-colors group ${
              pathname === "/home/settings"
                ? "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings className={`w-5 h-5 flex-shrink-0 ${pathname === "/home/settings" ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span className={`text-sm whitespace-nowrap ml-3 ${pathname === "/home/settings" ? "font-semibold" : ""}`}>
              Settings
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center rounded-lg px-2 py-1.5 w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
            <span className="text-sm whitespace-nowrap ml-3">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
