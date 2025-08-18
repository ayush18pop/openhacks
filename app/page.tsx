import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import EventsShowcase from "@/components/landing/EventsShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Sponsors from "@/components/landing/Sponsors";
import Footer from "@/components/landing/Footer";
import BackgroundWords from "@/components/landing/BackgroundWords";

export const dynamic = "force-dynamic";

export default function Home() {

  return (
     <main className="min-h-screen bg-black text-white">
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
