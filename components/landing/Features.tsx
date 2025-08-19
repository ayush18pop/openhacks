// components/landing/Features.tsx
import { Card, CardContent, CardTitle } from "../../components/retroui/Card"

export default function Features() {
  const items = [
    { title: "Event Management", desc: "Create tracks, timelines, rules, prizes and sponsors." },
    { title: "Team & Registration", desc: "Easy team formation, invites, roles and auth-ready hooks." },
    { title: "Submissions", desc: "Accept repos, docs, videos with multi-round flows." },
    { title: "Judging", desc: "Scorecards, aggregated leaderboards, and feedback." },
    { title: "Announcements", desc: "Real-time updates, Q&A, and reminders." },
    { title: "Role Dashboards", desc: "Separate views for participants, organizers & judges." },
  ]

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-foreground">
        Built for hackathons — everything you need
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
        A compact, opinionated feature set that covers the full event lifecycle from launch to judging.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card
            key={it.title}
            className="bg-background/50 border-border hover:scale-105 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm p-5"
          >
            <CardContent className="px-0">
              <CardTitle className="text-lg font-bold text-foreground">{it.title}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
