// components/landing/EventsShowcase.tsx
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/retroui/Card"

const SAMPLE = [
  { id: "synaphack-3", title: "SynapHack 3.0", tagline: "36-hour student hackathon", start: "Aug 25", online: true },
  { id: "buildweek", title: "Build Week", tagline: "Prototype & ship", start: "Sep 10", online: false, location: "Delhi" },
  { id: "ui-challenge", title: "UI Challenge", tagline: "Design & implement", start: "Sep 18", online: true },
]

export default function EventsShowcase() {
  return (
    <section className="mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
        <Link href="/events" className="text-sm text-muted-foreground hover:underline">
          Browse All
        </Link>
      </div>

      {/* Event Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE.map((e) => (
          <Link key={e.id} href={`/events/${e.id}`}>
            <Card
              className="cursor-pointer border border-border bg-background/50 backdrop-blur-sm 
                hover:scale-105 hover:shadow-2xl hover:border-foreground/30 transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-foreground">
                  {e.title}
                  <span className="text-xs text-muted-foreground">
                    {e.online ? "Online" : e.location ?? "Offline"}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">{e.tagline}</p>
                <div className="mt-2 text-xs text-muted-foreground">Starts: {e.start}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
