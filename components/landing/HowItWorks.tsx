// components/landing/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    { title: "Create event", desc: "Define tracks, rules, timeline and prizes." },
    { title: "Register & team up", desc: "Participants register, form teams and collaborate." },
    { title: "Submit & judge", desc: "Teams submit projects; judges review and score." },
  ];

  return (
    <section id="how" className="mt-16">
      <h2 className="text-2xl font-semibold">How it works</h2>
      <p className="mt-2 text-sm text-white/70 max-w-2xl">A simple three step flow so organizers and participants can focus on building.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {steps.map((s, idx) => (
          <div key={s.title} className="rounded-xl border border-white/8 bg-white/3 p-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl font-semibold">
              {idx + 1}
            </div>
            <div className="font-semibold">{s.title}</div>
            <div className="mt-2 text-sm text-white/70">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
