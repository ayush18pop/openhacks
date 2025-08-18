// components/landing/Hero.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <div className="inline-flex items-center rounded-full bg-white/4 px-3 py-1 text-sm text-white/80 mb-4">
            Student & Community Hackathons
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Host. Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A80FF] to-[#6C5CE7]">Ship</span> faster.
          </h1>

          <p className="mt-6 text-lg text-white/70 max-w-xl">
            Create events, manage teams, accept submissions, and run judging — all in one modern platform designed for students and communities.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/events">
              <Button className="rounded-full px-6 py-3">Browse events</Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-full px-6 py-3 border border-white/8 bg-transparent">Create event</Button>
            </Link>
          </div>

          <div className="mt-8 flex gap-6 text-sm text-white/60">
            <div>🏆 <strong>Prizes</strong> across tracks</div>
            <div>•</div>
            <div>👥 <strong>Teams</strong> & collaborators</div>
            <div>•</div>
            <div>🚀 <strong>Live judging</strong> & leaderboards</div>
          </div>
        </div>

        <div className="flex justify-center">
          {/* simple mock card to the right — replace with real illustration later */}
          <div className="w-full max-w-md rounded-2xl border border-white/8 bg-white/3 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">SynapHack 3.0</h3>
                <p className="text-xs text-white/60">Aug 25 — Aug 27 • Online</p>
              </div>
              <div className="text-sm text-white/80">Open</div>
            </div>
            <p className="mt-3 text-sm text-white/70">36-hour student hackathon with multiple tracks & mentorship.</p>
            <div className="mt-4">
              <Link href="/events/synaphack-3">
                <Button className="w-full">View event</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
