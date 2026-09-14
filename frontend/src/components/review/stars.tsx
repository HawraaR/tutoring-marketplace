import { Star } from "lucide-react";

interface StarsProps {
  value: number;
  size?: number;
  className?: string;
}

export function Stars({ value, size = 16, className = "" }: StarsProps) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));

  const row = (tone: string) => (
    <div className="flex w-max gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} style={{ width: size, height: size }} className={tone} />
      ))}
    </div>
  );

  return (
    <div className={`relative inline-block align-middle ${className}`} role="img" aria-label={`Rated ${value} out of 5`}>
      {row("fill-border-subtle text-border-subtle")}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("fill-amber-400 text-amber-400")}
      </div>
    </div>
  );
}