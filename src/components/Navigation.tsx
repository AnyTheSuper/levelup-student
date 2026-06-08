"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main menu" className="flex gap-2">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href === "/dashboard" && pathname === "/leaderboard");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              active
                ? "bg-white text-indigo-700 shadow-md"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
