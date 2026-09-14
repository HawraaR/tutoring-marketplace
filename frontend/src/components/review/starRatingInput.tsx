import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function StarRatingInput({ value, onChange, label }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
          className="rounded-sm p-0.5 transition-transform duration-100 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-blue"
        >
          <Star
            className={
              star <= active
                ? "h-6 w-6 fill-amber-400 text-amber-400"
                : "h-6 w-6 fill-border-subtle text-border-subtle"
            }
          />
        </button>
      ))}
      <span className="ml-2 w-8 text-xs font-medium text-muted tabular-nums">
        {value > 0 ? `${value}/5` : ""}
      </span>
    </div>
  );
}