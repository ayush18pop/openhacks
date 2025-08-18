// components/landing/Sponsors.tsx
export default function Sponsors() {
  const logos = [
    "/images/sponsors/sponsor-1.svg",
    "/images/sponsors/sponsor-2.svg",
    "/images/sponsors/sponsor-3.svg",
  ];

  return (
    <section id="sponsors" className="mt-16 mb-12">
      <h3 className="text-lg font-semibold">Trusted by</h3>
      <div className="mt-6 flex items-center gap-6 overflow-x-auto py-4">
        {logos.map((src, i) => (
          <div key={i} className="flex h-14 w-36 items-center justify-center rounded-md border border-white/6 bg-white/3 p-2">
            <img src={src} alt={`sponsor-${i}`} className="max-h-10 object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
