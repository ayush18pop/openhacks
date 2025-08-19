"use client";
// components/landing/Sponsors.tsx
import Image from "next/image"

export default function Sponsors() {
  // Public SVG/PNG logo URLs for big tech companies
  const logos = [
  "/images/sponsors/s1.webp",
  "/images/sponsors/s2.webp",
  "/images/sponsors/s3.webp",
  "/images/sponsors/s4.webp",
  "/images/sponsors/s5.webp",
  "/images/sponsors/s6.webp",
  "/images/sponsors/s7.webp",
  "/images/sponsors/s8.webp",
  ];

  // Duplicate logos for seamless infinite scroll
  const marqueeLogos = [...logos, ...logos];

  return (
    <section id="sponsors" className="mt-16 mb-12">
      <h3 className="text-lg font-bold text-foreground">Trusted by</h3>
      <div className="relative w-full overflow-hidden py-4">
        <div
          className="flex gap-8 animate-marquee"
          style={{ minWidth: '200%' }}
        >
          {marqueeLogos.map((src, i) => (
            <div
              key={i}
              className="flex h-20 w-44 items-center justify-center rounded-xl border border-border bg-background/30 p-2 backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              <Image src={src} alt={`sponsor-${i}`} width={50} height={20} className="object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
