// components/landing/Sponsors.tsx
import Image from "next/image"

export default function Sponsors() {
  const logos = [
    "/images/sponsors/sponsor-1.svg",
    "/images/sponsors/sponsor-2.svg",
    "/images/sponsors/sponsor-3.svg",
  ]

  return (
    <section id="sponsors" className="mt-16 mb-12">
      <h3 className="text-lg font-bold text-foreground">Trusted by</h3>

      <div className="mt-6 flex items-center gap-6 overflow-x-auto py-4">
        {logos.map((src, i) => (
          <div
            key={i}
            className="flex h-16 w-36 items-center justify-center rounded-xl border border-border bg-background/30 p-2 backdrop-blur-sm hover:scale-105 transition-all duration-300"
          >
            <Image src={src} alt={`sponsor-${i}`} width={140} height={40} className="object-contain" />
          </div>
        ))}
      </div>
    </section>
  )
}
