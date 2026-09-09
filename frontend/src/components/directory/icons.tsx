// src/components/tutors/icons.tsx
type IconProps = { className?: string };

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconSearch = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconStar = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" /></svg>
);
export const IconVerified = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.4 2.4 4.6-5" /></svg>
);
export const IconGrid = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const IconList = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg>
);
export const IconSliders = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.5" /><circle cx="10" cy="17" r="2.5" /></svg>
);
export const IconX = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconChevronLeft = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
);
export const IconChevronRight = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" {...base} aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
);