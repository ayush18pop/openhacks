// components/landing/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between">
        <div>© {new Date().getFullYear()} SynapHack</div>
        <div className="mt-3 sm:mt-0">
          Built with Next.js • Tailwind • RetroUI
        </div>
      </div>
    </footer>
  )
}
