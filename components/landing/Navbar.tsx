"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../../components/retroui/Button";
import { Text } from "../../components/retroui/Text";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

// A new, more stylized logo component using your theme's fonts
const Logo = () => (
  <Link href="/" className="block group" aria-label="OpenHacks Home">
    <div className="border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
      <h1 className="font-head text-xl font-bold text-[var(--foreground)]" style={{ textShadow: 'none' }}>
        Open<span className="text-[var(--primary)]">Hacks</span>
      </h1>
    </div>
  </Link>
);


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b-2 border-[var(--border)] border-t-4 border-t-[var(--primary)]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        <Logo />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <SignedIn>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Text className={clsx("hover:text-[var(--primary)] transition-colors font-bold relative", {
                  "text-[var(--primary)] after:w-full": pathname === link.href,
                  "text-[var(--muted-foreground)] after:w-0": pathname !== link.href,
                  "after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-[var(--primary)] after:transition-all after:duration-300": true
                })}>
                  {link.label}
                </Text>
              </Link>
            ))}
          </SignedIn>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="secondary">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="secondary" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t-2 border-[var(--border)] bg-background">
          <nav className="flex flex-col items-center gap-6 p-6">
            <SignedIn>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                  <Text className="text-lg font-bold">{link.label}</Text>
                </Link>
              ))}
            </SignedIn>
            <div className="flex items-center gap-3 pt-6 border-t-2 border-[var(--border)] w-full justify-center">
              <SignedOut>
                <Link href="/sign-in" className="flex-1">
                  <Button variant="secondary" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" className="flex-1">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
