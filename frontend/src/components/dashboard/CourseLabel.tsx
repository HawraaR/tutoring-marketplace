const accent: Record<string, string> = {
  burgundy: "border-l-burgundy bg-burgundy/10 text-burgundy",
  slate: "border-l-slate-blue bg-slate-blue/10 text-slate-blue",
  olive: "border-l-olive bg-olive/10 text-olive",
};

interface CourseLabelProps {
  code: string;
  title: string;
  tone: keyof typeof accent;
}

export function CourseLabel({ code, title, tone }: CourseLabelProps) {
  return (
    <span className={`inline-flex items-baseline gap-2 border-l-[3px] py-0.5 pr-2 pl-2 ${accent[tone]}`}>
      <span className="font-mono text-[11px] font-semibold tracking-wide">{code}</span>
      <span className="text-xs font-medium text-ink">{title}</span>
    </span>
  );
}
