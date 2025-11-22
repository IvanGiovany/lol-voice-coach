import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Yuumi Voice Coach" },
  { href: "/matchups", label: "Matchup Lab" },
  { href: "/smite", label: "Baron Smite Trainer" }
];

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0F0E] text-gray-200">
      {/* Top nav */}
      <header className="border-b border-[#1A221E] bg-[#101613]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-lime-500 flex items-center justify-center text-xs font-bold text-black shadow">
              LoL
            </div>

            <div>
              <h1 className="text-base font-semibold tracking-tight text-gray-100">
                Summoner Studio
              </h1>
              <p className="text-[11px] text-gray-400">
                AI Coaching · Draft Insights · Champion Intelligence
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-2 text-xs">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === "/"
                  : router.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition font-medium ${
                    isActive
                      ? "bg-lime-500 text-black shadow"
                      : "text-gray-400 hover:text-white hover:bg-[#1A221E]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-[#1A221E] bg-[#101613] mt-8">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-[11px] text-gray-500">
          <span>Summoner Studio © 2025</span>
          <span>Powered by Riot Data Dragon & AI</span>
        </div>
      </footer>
    </div>
  );
}
