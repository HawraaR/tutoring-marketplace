// src/lib/tutor-filters.ts
import type { TutorListItem, AvailabilitySlot } from './../../types/tutor';

export type SortKey = 'featured' | 'rating' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
export interface TutorFilters {
  search: string;    // matches User.firstName / lastName
  subjectId: string; // 'all' | Subject.id
  priceMin: number;  // TutorProfile.hourlyRate >= priceMin
  priceMax: number;  // TutorProfile.hourlyRate <= priceMax
  days: number[];    // JS Date.getDay() values (0=Sun … 6=Sat) with free slots
}

export const PRICE_BOUNDS = { min: 0, max: 100 };

export const defaultFilters: TutorFilters = {
  search: '',
  subjectId: 'all',
  priceMin: PRICE_BOUNDS.min,
  priceMax: PRICE_BOUNDS.max,
  days: [],
};

export const DAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

/** Only APPROVED tutors with open future slots on the selected days, etc. */
export function applyFilters(tutors: TutorListItem[], f: TutorFilters): TutorListItem[] {
  const now = new Date();
  const q = f.search.trim().toLowerCase();

  return tutors.filter((t) => {
    const p = t.tutorProfile;
    if (!p || p.verificationStatus !== 'APPROVED') return false;

    // Name filter (User.firstName + lastName)
    if (q) {
      const name = `${t.firstName ?? ''} ${t.lastName ?? ''}`.toLowerCase();
      if (!name.includes(q)) return false;
    }

    // Price filter (TutorProfile.hourlyRate)
    if (p.hourlyRate < f.priceMin || p.hourlyRate > f.priceMax) return false;

    // Subject filter (TutorSubject junction)
    if (f.subjectId !== 'all' && !t.tutorSubjects.some((ts) => ts.subjectId === f.subjectId)) return false;

    // Availability filter (AvailabilitySlot, any of the selected weekdays, not booked, in the future)
    if (f.days.length > 0) {
      const hasSlot = t.availability.some(
        (s) => !s.isBooked && new Date(s.startTime) > now && f.days.includes(new Date(s.startTime).getDay()),
      );
      if (!hasSlot) return false;
    }

    return true;
  });
}

export function sortTutors(list: TutorListItem[], sort: SortKey): TutorListItem[] {
  const arr = [...list];
  const rate = (t: TutorListItem) => t.tutorProfile?.hourlyRate ?? 0;
  const rating = (t: TutorListItem) => t.tutorProfile?.averageRating ?? 0;
  const reviews = (t: TutorListItem) => t.tutorProfile?.reviewCount ?? 0;
  const fullname = (t: TutorListItem) => `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim().toLowerCase();
  switch (sort) {
  case 'name-asc':  return arr.sort((a, b) => fullname(a).localeCompare(fullname(b)));
  case 'name-desc': return arr.sort((a, b) => fullname(b).localeCompare(fullname(a)));
  case 'price-asc':  return arr.sort((a, b) => rate(a) - rate(b));
  case 'price-desc': return arr.sort((a, b) => rate(b) - rate(a));
  case 'rating':     return arr.sort((a, b) => rating(b) - rating(a) || reviews(b) - reviews(a));
  case 'featured':
  default:
    return arr.sort(
      (a, b) =>
        Number(b.tutorProfile?.isFeatured ?? false) - Number(a.tutorProfile?.isFeatured ?? false) ||
        rating(b) - rating(a),
    );
}
}

/** Earliest upcoming free slot — used for the "Next: Tue" hint on cards. */
export function nextAvailableSlot(t: TutorListItem): AvailabilitySlot | null {
  const now = new Date();
  return (
    t.availability
      .filter((s) => !s.isBooked && new Date(s.startTime) > now)
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))[0] ?? null
  );
}

export function countActiveFilters(f: TutorFilters): number {
  let n = 0;
  if (f.search.trim()) n++;
  if (f.subjectId !== 'all') n++;
  if (f.priceMin !== PRICE_BOUNDS.min || f.priceMax !== PRICE_BOUNDS.max) n++;
  if (f.days.length > 0) n++;
  return n;
}