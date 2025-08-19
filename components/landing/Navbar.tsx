"use client";

import Link from "next/link";
import { Button } from "../../components/retroui/Button";
import { Text } from "../../components/retroui/Text";
import { SignInButton } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Text as="span" className="text-lg font-bold text-foreground">
            Open
            <Text as="span" className="text-primary">
              Hacks
            </Text>
          </Text>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/events">
            <Text className="hover:text-foreground transition-colors cursor-pointer">Events</Text>
          </Link>
          <Link href="#how">
            <Text className="hover:text-foreground transition-colors cursor-pointer">How it works</Text>
          </Link>
          <Link href="#sponsors">
            <Text className="hover:text-foreground transition-colors cursor-pointer">Sponsors</Text>
          </Link>
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Button variant="secondary">
              <SignInButton/>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button variant="secondary">
              <SignOutButton/>
            </Button>
          </SignedIn>
          <Link href="/sign-up">
            <Button>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
