// components/landing/Navbar.tsx
"use client";

import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur border-b border-white/6">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold">Open<span className="text-[#6C5CE7]">Hacks</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="/events" className="hover:text-white">Events</Link>
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#sponsors" className="hover:text-white">Sponsors</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="px-4 py-2 text-sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="px-5 py-2 text-sm rounded-full">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
