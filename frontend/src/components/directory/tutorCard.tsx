// src/components/tutors/TutorCard.tsx
import type { TutorListItem } from '../../types/tutor';
import { nextAvailableSlot } from '../../lib/directory/tutorFilters';
import { IconStar, IconVerified } from './icons';

const AVATAR_COLORS = ['bg-slate-blue', 'bg-burgundy', 'bg-olive', 'bg-brand-secondary', 'bg-brand-primary'];

function displayName(t: TutorListItem) {
  return `${t.firstName ?? ''}${t.lastName ? ` ${t.lastName}.` : ''}`.trim();
}
function initials(t: TutorListItem) {
  return `${t.firstName?.[0] ?? ''}${t.lastName?.[0] ?? ''}`.toUpperCase();
}
function avatarColor(t: TutorListItem) {
  const key = `${t.firstName}${t.lastName}`;
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function SubjectChips({ tutor }: { tutor: TutorListItem }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tutor.tutorSubjects.map((ts) => (
        <li key={ts.subjectId} className="rounded-md border border-border-subtle bg-surface-bg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {ts.subject.name}
        </li>
      ))}
    </ul>
  );
}

function Rating({ tutor }: { tutor: TutorListItem }) {
  const p = tutor.tutorProfile!;
  if (p.reviewCount === 0) {
    return <span className="rounded-md bg-olive/10 px-2 py-0.5 text-xs font-semibold text-olive">New tutor</span>;
  }
  return (
    <span className="flex items-center gap-1 text-sm text-muted">
      <IconStar className="h-4 w-4 text-amber-500" />
      <span className="font-semibold text-ink">{p.averageRating.toFixed(1)}</span>
      ({p.reviewCount} review{p.reviewCount === 1 ? '' : 's'})
    </span>
  );
}

function AvailabilityHint({ tutor }: { tutor: TutorListItem }) {
  const next = nextAvailableSlot(tutor);
  if (!next) return <span className="text-xs text-muted">No open slots this week</span>;
  const day = new Date(next.startTime).toLocaleDateString('en-US', { weekday: 'short' });
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span className="h-2 w-2 rounded-full bg-olive" />
      Next opening: <span className="font-semibold text-ink">{day}</span>
    </span>
  );
}

function Price({ tutor, size = 'md' }: { tutor: TutorListItem; size?: 'md' | 'lg' }) {
  return (
    <p className={size === 'lg' ? 'text-2xl font-bold text-ink' : 'text-xl font-bold text-ink'}>
      ${tutor.tutorProfile!.hourlyRate}
      <span className="text-sm font-normal text-muted"> / hr</span>
    </p>
  );
}

function Actions({ tutor }: { tutor: TutorListItem }) {
  return (
    <div className="flex items-center gap-2">
      <a href={`/tutors/${tutor.id}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5">
        Details
      </a>
      <a href={`/tutors/${tutor.id}/book`} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-warm-sm transition-colors hover:bg-brand-primary-hover">
        Book Now
      </a>
    </div>
  );
}

function NameRow({ tutor }: { tutor: TutorListItem }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <h3 className="min-w-0 font-serif text-lg font-semibold text-ink">{displayName(tutor)}</h3>
      {tutor.tutorProfile!.verificationStatus === 'APPROVED' && (
        <IconVerified className="h-4 w-4 shrink-0 text-slate-blue" />
      )}
      {tutor.tutorProfile!.isFeatured && (
        <span className="shrink-0 rounded-md bg-burgundy/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy">Featured</span>
      )}
    </span>
  );
}

export function TutorCard({ tutor, view }: { tutor: TutorListItem; view: 'grid' | 'list' }) {
  const p = tutor.tutorProfile;
  if (!p) return null;

  if (view === 'list') {
    return (
      <article className="flex flex-col gap-5 rounded-0 border border-border-subtle bg-surface-card p-5 shadow-warm-sm transition-shadow hover:shadow-warm md:flex-row">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ${avatarColor(tutor)}`}>
            {initials(tutor)}
          </div>
          <div className="min-w-0 flex-1">
            <NameRow tutor={tutor} />
            {p.education && <p className="mt-0.5 truncate text-sm text-muted">{p.education}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Rating tutor={tutor} />
              <AvailabilityHint tutor={tutor} />
            </div>
            <div className="mt-3"><SubjectChips tutor={tutor} /></div>
            <p className="mt-3 line-clamp-2 text-sm text-muted">{p.headline ?? p.bio}</p>
            <p className="mt-1 text-xs text-muted">Speaks: {p.languages.join(', ')}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4 md:w-52 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-5 md:pt-0">
          <Price tutor={tutor} size="lg" />
          <Actions tutor={tutor} />
        </div>
      </article>
    );
  }

  // Grid view
  return (
    <article className="flex flex-col  border border-border-subtle bg-surface-card p-5 shadow-warm-sm transition-shadow hover:shadow-warm">
      <header className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold text-white ${avatarColor(tutor)}`}>
          {initials(tutor)}
        </div>
        <div className="min-w-0 flex-1">
          <NameRow tutor={tutor} />
          {p.education && <p className="mt-0.5 truncate text-sm text-muted">{p.education}</p>}
          <div className="mt-1.5"><Rating tutor={tutor} /></div>
        </div>
      </header>

      <div className="mt-4 flex-1">
        <SubjectChips tutor={tutor} />
        <p className="mt-3 line-clamp-2 text-sm text-muted">{p.headline ?? p.bio}</p>
        <div className="mt-3"><AvailabilityHint tutor={tutor} /></div>
      </div>

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
        <Price tutor={tutor} />
        <Actions tutor={tutor} />
      </footer>
    </article>
  );
}