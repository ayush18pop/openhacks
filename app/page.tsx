import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import EventsShowcase from "@/components/landing/EventsShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Sponsors from "@/components/landing/Sponsors";
import Footer from "@/components/landing/Footer";
import BackgroundWords from "@/components/landing/BackgroundWords";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function Home() {

  return (
     <main className="min-h-screen bg-black text-white relative">
      {/* Auth buttons - fixed top-right corner */}
      <div className="fixed top-20 right-4 z-50">
        <SignedIn>
          <SignOutButton>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg">
              Logout
            </button>
          </SignOutButton>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg">
              Sign In
            </button>
          </Link>
        </SignedOut>
      </div>

      <BackgroundWords />
      <Navbar />
      <Hero />
      <div className="mx-auto max-w-7xl px-4">
        <Features />
        <EventsShowcase />
        <HowItWorks />
        <Sponsors />
      </div>
      <Footer />
    </main>

  );
}
