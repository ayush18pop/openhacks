// components/landing/EventsShowcase.tsx
import Link from "next/link";

const SAMPLE = [
  { id: "synaphack-3", title: "SynapHack 3.0", tagline: "36-hour student hackathon", start: "Aug 25", online: true },
  { id: "buildweek", title: "Build Week", tagline: "Prototype & ship", start: "Sep 10", online: false, location: "Delhi" },
  { id: "ui-challenge", title: "UI Challenge", tagline: "Design & implement", start: "Sep 18", online: true },
];

export default function EventsShowcase() {
  return (
    <section className="mt-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Upcoming events</h2>
        <Link href="/events" className="text-sm text-white/70 hover:underline">Browse all</Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE.map((e) => (
          <Link key={e.id} href={`/events/${e.id}`} className="block rounded-xl border border-white/8 bg-white/3 p-4 hover:scale-[1.01] transition">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{e.title}</h3>
              <span className="text-xs text-white/60">{e.online ? "Online" : e.location ?? "Offline"}</span>
            </div>
            <p className="mt-2 text-sm text-white/70">{e.tagline}</p>
            <div className="mt-3 text-xs text-white/60">Starts: {e.start}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
