import Image from "next/image";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import EventsShowcase from "../components/landing/EventsShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import Sponsors from "../components/landing/Sponsors";
import Footer from "../components/landing/Footer";
import {BoxesCore} from "../components/landing/Background";
import BackgroundWords from "../components/landing/BackgroundWords";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white relative">
      <main className="relative z-20 mt-4 ml-4 mr-4 rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10">
          <div className="mb-6">
            <Navbar />
          </div>
          <div className="mb-6">
            <Hero />
          </div>
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6">
              <Features />
            </div>
            <div className="mb-6">
              <EventsShowcase />
            </div>
            <div className="mb-6">
              <HowItWorks />
            </div>
            <div className="mb-6">
              <Sponsors />
            </div>
          </div>
          <div className="mb-6">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
