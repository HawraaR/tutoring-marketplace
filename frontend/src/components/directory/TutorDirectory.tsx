'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Subject } from '../../types/tutor';
import { TutorsAPI } from '../../api/TutorsAPI';
import {
  applyFilters, defaultFilters, sortTutors,
  type SortKey, type TutorFilters,
} from '../../lib/directory/tutorFilters';
import { FilterPanel } from './filterPanel';
import { TutorCard } from './tutorCard';
import { IconChevronLeft, IconChevronRight, IconGrid, IconList } from './icons';

const PAGE_SIZE = 50;

function pageList(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (page > 3) pages.push('…');
  for (let p = Math.max(2, page - 1); p <= Math.min(count - 1, page + 1); p++) pages.push(p);
  if (page < count - 2) pages.push('…');
  pages.push(count);
  return pages;
}

export default function TutorDirectory() {
  const [tutors, setTutors] = useState<Awaited<ReturnType<typeof TutorsAPI.getTutors>>>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<TutorFilters>(defaultFilters);
  const [sort, setSort] = useState<SortKey>('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    TutorsAPI.getTutors()
      .then((data) => { if (mounted) setTutors(data); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPage(1), [filters, sort]);

  const subjects = useMemo<Subject[]>(() => {
    const map = new Map<string, Subject>();
    tutors.forEach((t) => t.tutorSubjects.forEach((ts) => map.set(ts.subject.id, ts.subject)));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [tutors]);

  const filtered = useMemo(() => sortTutors(applyFilters(tutors, filters), sort), [tutors, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goPage = (p: number) => {
    setPage(p);
    document.getElementById('directory-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="directory-top" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header: count + sort + view toggle ──────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">
            {loading ? 'Loading tutors…' : `${filtered.length} Tutor${filtered.length === 1 ? '' : 's'} Available`}
          </h1>
          <p className="mt-1 text-sm text-muted">Verified peer tutors · filtered by your preferences</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink focus:border-slate-blue focus:outline-none"
            >
              <option value="featured">Featured first</option>
              <option value="rating">Highest rated</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>
          </label>

          <div className="flex overflow-hidden rounded-lg border border-border-subtle bg-surface-card" role="group" aria-label="View mode">
            <button
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
              title="Grid view"
              className={`px-3 py-2 ${view === 'grid' ? 'bg-brand-primary text-white' : 'text-muted hover:text-ink'}`}
            >
              <IconGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              title="List view"
              className={`px-3 py-2 ${view === 'list' ? 'bg-brand-primary text-white' : 'text-muted hover:text-ink'}`}
            >
              <IconList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Horizontal filter bar (replaces sidebar) ── */}
      <div className="mt-6">
        <FilterPanel filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} subjects={subjects} />
      </div>

      {/* ── Results ─────────────────────────────────── */}
      <div className="mt-6">
        {loading ? (
          <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl border border-border-subtle bg-surface-card p-5">
                <div className="h-12 w-12 rounded-full bg-border-subtle" />
                <div className="mt-4 h-4 w-2/3 rounded bg-border-subtle" />
                <div className="mt-2 h-4 w-1/2 rounded bg-border-subtle" />
                <div className="mt-6 h-20 rounded bg-border-subtle" />
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface-card p-12 text-center">
            <p className="font-serif text-lg font-semibold text-ink">No tutors match your filters</p>
            <p className="mt-1 text-sm text-muted">Try widening the price range or clearing some filters.</p>
            <button
              onClick={() => setFilters(defaultFilters)}
              className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'}>
            {paged.map((t) => (
              <TutorCard key={t.id} tutor={t} view={view} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────── */}
      {!loading && pageCount > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
          <button
            disabled={page === 1}
            onClick={() => goPage(page - 1)}
            className="rounded-lg border border-border-subtle bg-surface-card p-2 text-muted disabled:opacity-40"
            aria-label="Previous page"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          {pageList(page, pageCount).map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} className="px-1 text-muted">…</span>
            ) : (
              <button
                key={p}
                onClick={() => goPage(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                  p === page ? 'bg-brand-primary text-white' : 'border border-border-subtle bg-surface-card text-muted hover:text-ink'
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            disabled={page === pageCount}
            onClick={() => goPage(page + 1)}
            className="rounded-lg border border-border-subtle bg-surface-card p-2 text-muted disabled:opacity-40"
            aria-label="Next page"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
// // src/components/tutors/TutorDirectory.tsx
// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import type { Subject } from '../../types/tutor';
// import { TutorsAPI } from '../../api/TutorsAPI';
// import {
//   applyFilters, countActiveFilters, defaultFilters, sortTutors,
//   type SortKey, type TutorFilters,
// } from '../../lib/directory/tutorFilters';
// import { FilterPanel } from './filterPanel';
// import { TutorCard } from './tutorCard';
// import { IconChevronLeft, IconChevronRight, IconGrid, IconList, IconSliders, IconX } from './icons';

// const PAGE_SIZE = 50;

// function pageList(page: number, count: number): (number | '…')[] {
//   if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
//   const pages: (number | '…')[] = [1];
//   if (page > 3) pages.push('…');
//   for (let p = Math.max(2, page - 1); p <= Math.min(count - 1, page + 1); p++) pages.push(p);
//   if (page < count - 2) pages.push('…');
//   pages.push(count);
//   return pages;
// }

// export default function TutorDirectory() {
//   const [tutors, setTutors] = useState<Awaited<ReturnType<typeof TutorsAPI.getTutors>>>([]);
//   const [loading, setLoading] = useState(true);

//   const [filters, setFilters] = useState<TutorFilters>(defaultFilters);
//   const [sort, setSort] = useState<SortKey>('featured');
//   const [view, setView] = useState<'grid' | 'list'>('grid');
//   const [page, setPage] = useState(1);
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   useEffect(() => {
//     let mounted = true;

//     TutorsAPI.getTutors()
//       .then((data) => {
//         if (mounted) setTutors(data);
//       })
//       .finally(() => {
//         if (mounted) setLoading(false);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // eslint-disable-next-line react-hooks/set-state-in-effect
//   useEffect(() => setPage(1), [filters, sort]);

//   const subjects = useMemo<Subject[]>(() => {
//     const map = new Map<string, Subject>();
//     tutors.forEach((t) => t.tutorSubjects.forEach((ts) => map.set(ts.subject.id, ts.subject)));
//     return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
//   }, [tutors]);

//   const filtered = useMemo(() => sortTutors(applyFilters(tutors, filters), sort), [tutors, filters, sort]);

//   const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
//   const activeCount = countActiveFilters(filters);

//   const goPage = (p: number) => {
//     setPage(p);
//     document.getElementById('directory-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   const filterPanel = (
//     <FilterPanel filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} subjects={subjects} />
//   );

//   return (
//     <div id="directory-top" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//       <div className="lg:flex lg:gap-8">
//         {/* ── Sidebar (desktop) ─────────────────────────── */}
//         <aside className="hidden w-72 shrink-0 lg:block">
//           <div className="sticky top-8  border border-border-subtle bg-surface-card p-5 shadow-warm-sm">
//             {filterPanel}
//           </div>
//         </aside>

//         {/* ── Mobile filter drawer ──────────────────────── */}
//         {drawerOpen && (
//           <div className="fixed inset-0 z-40 lg:hidden">
//             <div className="absolute inset-0 bg-charcoal/40" onClick={() => setDrawerOpen(false)} />
//             <div className="absolute inset-y-0 left-0 w-80 max-w-[88%] overflow-y-auto bg-surface-card p-5 shadow-warm">
//               <div className="mb-4 flex justify-end">
//                 <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="rounded-lg p-2 text-muted hover:bg-surface-bg hover:text-ink">
//                   <IconX className="h-5 w-5" />
//                 </button>
//               </div>
//               {filterPanel}
//               <button
//                 onClick={() => setDrawerOpen(false)}
//                 className="mt-6 w-full rounded-lg bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover"
//               >
//                 Show {filtered.length} tutor{filtered.length === 1 ? '' : 's'}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ── Main content ──────────────────────────────── */}
//         <main className="min-w-0 flex-1">
//           <div className="flex flex-wrap items-end justify-between gap-4">
//             <div>
//               <h1 className="font-serif text-3xl font-bold text-ink">
//                 {loading ? 'Loading tutors…' : `${filtered.length} Tutor${filtered.length === 1 ? '' : 's'} Available`}
//               </h1>
//               <p className="mt-1 text-sm text-muted">Verified peer tutors · filtered by your preferences</p>
//             </div>

//             <div className="flex flex-wrap items-center gap-3">
//               {/* Mobile filters button */}
//               <button
//                 onClick={() => setDrawerOpen(true)}
//                 className="relative flex items-center gap-2  border border-border-subtle bg-surface-card px-3 py-2 text-sm font-semibold text-ink lg:hidden"
//               >
//                 <IconSliders className="h-4 w-4" /> Filters
//                 {activeCount > 0 && (
//                   <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-[11px] font-bold text-white">
//                     {activeCount}
//                   </span>
//                 )}
//               </button>

//               {/* Sort */}
//               <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
//                 Sort by
//                 <select
//                   value={sort}
//                   onChange={(e) => setSort(e.target.value as SortKey)}
//                   className="rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink focus:border-slate-blue focus:outline-none"
//                 >
//                   <option value="featured">Featured first</option>
//                   <option value="rating">Highest rated</option>
//                   <option value="price-asc">Price: low → high</option>
//                   <option value="price-desc">Price: high → low</option>
//                   <option value="name-asc">Name: A → Z</option>
//                   <option value="name-desc">Name: Z → A</option>
//                 </select>
//               </label>

//               {/* View toggle */}
//               <div className="flex overflow-hidden rounded-lg border border-border-subtle bg-surface-card" role="group" aria-label="View mode">
//                 <button
//                   onClick={() => setView('grid')}
//                   aria-pressed={view === 'grid'}
//                   title="Grid view"
//                   className={`px-3 py-2 ${view === 'grid' ? 'bg-brand-primary text-white' : 'text-muted hover:text-ink'}`}
//                 >
//                   <IconGrid className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => setView('list')}
//                   aria-pressed={view === 'list'}
//                   title="List view"
//                   className={`px-3 py-2 ${view === 'list' ? 'bg-brand-primary text-white' : 'text-muted hover:text-ink'}`}
//                 >
//                   <IconList className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Results */}
//           <div className="mt-6">
//             {loading ? (
//               <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
//                 {Array.from({ length: 6 }).map((_, i) => (
//                   <div key={i} className="h-64 animate-pulse rounded-xl border border-border-subtle bg-surface-card p-5">
//                     <div className="h-12 w-12 rounded-full bg-border-subtle" />
//                     <div className="mt-4 h-4 w-2/3 rounded bg-border-subtle" />
//                     <div className="mt-2 h-4 w-1/2 rounded bg-border-subtle" />
//                     <div className="mt-6 h-20 rounded bg-border-subtle" />
//                   </div>
//                 ))}
//               </div>
//             ) : paged.length === 0 ? (
//               <div className="rounded-xl border border-border-subtle bg-surface-card p-12 text-center">
//                 <p className="font-serif text-lg font-semibold text-ink">No tutors match your filters</p>
//                 <p className="mt-1 text-sm text-muted">Try widening the price range or clearing some filters.</p>
//                 <button
//                   onClick={() => setFilters(defaultFilters)}
//                   className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
//                 >
//                   Clear all filters
//                 </button>
//               </div>
//             ) : (
//               <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'}>
//                 {paged.map((t) => (
//                   <TutorCard key={t.id} tutor={t} view={view} />
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Pagination */}
//           {!loading && pageCount > 1 && (
//             <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
//               <button
//                 disabled={page === 1}
//                 onClick={() => goPage(page - 1)}
//                 className="rounded-lg border border-border-subtle bg-surface-card p-2 text-muted disabled:opacity-40"
//                 aria-label="Previous page"
//               >
//                 <IconChevronLeft className="h-4 w-4" />
//               </button>
//               {pageList(page, pageCount).map((p, i) =>
//                 p === '…' ? (
//                   <span key={`e-${i}`} className="px-1 text-muted">…</span>
//                 ) : (
//                   <button
//                     key={p}
//                     onClick={() => goPage(p)}
//                     aria-current={p === page ? 'page' : undefined}
//                     className={`h-9 w-9 rounded-lg text-sm font-semibold ${
//                       p === page ? 'bg-brand-primary text-white' : 'border border-border-subtle bg-surface-card text-muted hover:text-ink'
//                     }`}
//                   >
//                     {p}
//                   </button>
//                 ),
//               )}
//               <button
//                 disabled={page === pageCount}
//                 onClick={() => goPage(page + 1)}
//                 className="rounded-lg border border-border-subtle bg-surface-card p-2 text-muted disabled:opacity-40"
//                 aria-label="Next page"
//               >
//                 <IconChevronRight className="h-4 w-4" />
//               </button>
//             </nav>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }
// src/components/tutors/TutorDirectory.tsx
