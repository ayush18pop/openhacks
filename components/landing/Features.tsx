// components/landing/Features.tsx
export default function Features() {
  const items = [
    { title: "Event Management", desc: "Create tracks, timelines, rules, prizes and sponsors." },
    { title: "Team & Registration", desc: "Easy team formation, invites, roles and auth-ready hooks." },
    { title: "Submissions", desc: "Accept repos, docs, videos with multi-round flows." },
    { title: "Judging", desc: "Scorecards, aggregated leaderboards, and feedback." },
    { title: "Announcements", desc: "Real-time updates, Q&A, and reminders." },
    { title: "Role Dashboards", desc: "Separate views for participants, organizers & judges." },
  ];

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold">Built for hackathons — everything you need</h2>
      <p className="mt-2 text-sm text-white/70 max-w-2xl">
        A compact, opinionated feature set that covers the full event lifecycle from launch to judging.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-xl border border-white/8 bg-white/3 p-5">
            <div className="text-lg font-semibold">{it.title}</div>
            <div className="mt-2 text-sm text-white/70">{it.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
