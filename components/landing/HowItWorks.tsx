// components/landing/HowItWorks.tsx
import { Card, CardContent, CardTitle } from "../../components/retroui/Card"

export default function HowItWorks() {
  const steps = [
    { title: "Create event", desc: "Define tracks, rules, timeline and prizes." },
    { title: "Register & team up", desc: "Participants register, form teams and collaborate." },
    { title: "Submit & judge", desc: "Teams submit projects; judges review and score." },
  ]

  return (
    <section id="how" className="mt-16">
      <h2 className="text-2xl font-bold text-foreground">How it works</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
        A simple three-step flow so organizers and participants can focus on building.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {steps.map((s, idx) => (
          <Card
            key={s.title}
            className="rounded-xl border-border bg-background/50 p-6 text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
          >
            <CardContent className="px-0">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background/30 text-xl font-bold text-foreground">
                {idx + 1}
              </div>
              <CardTitle className="text-lg font-bold text-foreground">{s.title}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
