export const DotBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full bg-[var(--background)] bg-dot-white/[0.2] relative">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-[var(--background)] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-20">{children}</div>
    </div>
  );
};