
import { TutorApplications } from "../components/admin/TutorApplications";

const overviewStats = [
  {
    label: "Total users",
    value: "1,284",
    detail: "All registered accounts",
    change: "+8.4%",
    positive: true,
  },
  {
    label: "Active tutors",
    value: "186",
    detail: "Approved tutor accounts",
    change: "+5.2%",
    positive: true,
  },
  {
    label: "Active students",
    value: "1,098",
    detail: "Registered students",
    change: "+9.1%",
    positive: true,
  },
  {
    label: "Pending verification",
    value: "24",
    detail: "Tutors awaiting review",
    change: "Needs attention",
    positive: false,
  },
];

const bookingStats = [
  {
    label: "Today's sessions",
    value: "42",
  },
  {
    label: "Upcoming",
    value: "128",
  },
  {
    label: "Completed",
    value: "1,426",
  },
  {
    label: "Cancelled",
    value: "38",
  },
];

const upcomingSessions = [
  {
    time: "10:00 AM",
    student: "Maya Williams",
    tutor: "Daniel Smith",
    subject: "Mathematics",
    status: "CONFIRMED",
  },
  {
    time: "11:30 AM",
    student: "Adam Brown",
    tutor: "Sarah Wilson",
    subject: "Physics",
    status: "CONFIRMED",
  },
  {
    time: "01:00 PM",
    student: "Lina Haddad",
    tutor: "James Miller",
    subject: "English",
    status: "PENDING",
  },
  {
    time: "03:30 PM",
    student: "Noah Taylor",
    tutor: "Emma Wilson",
    subject: "Programming",
    status: "CONFIRMED",
  },
];

const subjectDemand = [
  {
    subject: "Mathematics",
    bookings: 342,
    percentage: 86,
  },
  {
    subject: "Computer Science",
    bookings: 286,
    percentage: 72,
  },
  {
    subject: "Physics",
    bookings: 218,
    percentage: 55,
  },
  {
    subject: "English",
    bookings: 184,
    percentage: 46,
  },
  {
    subject: "Chemistry",
    bookings: 142,
    percentage: 36,
  },
];

const topTutors = [
  {
    name: "Daniel Smith",
    subject: "Mathematics",
    rating: 4.9,
    sessions: 128,
    earnings: "$3,840",
  },
  {
    name: "Sarah Wilson",
    subject: "Physics",
    rating: 4.9,
    sessions: 116,
    earnings: "$3,480",
  },
  {
    name: "James Miller",
    subject: "Computer Science",
    rating: 4.8,
    sessions: 104,
    earnings: "$3,120",
  },
  {
    name: "Emma Wilson",
    subject: "English",
    rating: 4.8,
    sessions: 96,
    earnings: "$2,880",
  },
];

const recentActivity = [
  {
    action: "New tutor registration",
    user: "Sarah Johnson",
    time: "10 minutes ago",
    type: "user",
  },
  {
    action: "Tutor verification submitted",
    user: "Michael Chen",
    time: "32 minutes ago",
    type: "verification",
  },
  {
    action: "Booking completed",
    user: "Maya Williams",
    time: "1 hour ago",
    type: "booking",
  },
  {
    action: "New student registered",
    user: "Lina Haddad",
    time: "2 hours ago",
    type: "user",
  },
  {
    action: "Booking cancelled",
    user: "Adam Brown",
    time: "3 hours ago",
    type: "warning",
  },
];

/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: string;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>

      {action && (
        <button className="shrink-0 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
          {action}
        </button>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
}) {
  const styles = {
    CONFIRMED:
      "bg-success/10 text-success",
    PENDING:
      "bg-warning/10 text-warning",
    COMPLETED:
      "bg-brand-primary/10 text-brand-primary",
    CANCELLED:
      "bg-error/10 text-error",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function AdminD() {
  return (
    <main className="min-h-screen bg-surface-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <section>
          <div>

            <h1 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl">
              Administration
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Monitor users, tutoring sessions, platform activity,
              verification requests, and overall marketplace performance.
            </p>
          </div>
        </section>

        {/* =================================================
            OVERVIEW STATS
        ================================================= */}

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-ink">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-sm font-bold text-brand-primary">
                    {stat.label === "Total users" && "U"}
                    {stat.label === "Active tutors" && "T"}
                    {stat.label === "Active students" && "S"}
                    {stat.label === "Pending verification" && "!"}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted">
                    {stat.detail}
                  </p>

                  <span
                    className={`text-xs font-semibold ${
                      stat.positive
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================
            USER MANAGEMENT + VERIFICATION
        ================================================= */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* User Management */}
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm xl:col-span-2">
            <SectionHeader
              title="User Management"
              description="Monitor students, tutors, and multi-role accounts."
              action="View all users"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-lg border border-border-subtle bg-surface-bg p-4">
                <p className="text-sm text-muted">Students</p>
                <p className="mt-2 text-2xl font-bold text-ink">
                  1,098
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle">
                  <div className="h-full w-[86%] rounded-full bg-slate-blue" />
                </div>

                <p className="mt-2 text-xs text-muted">
                  85.5% of users
                </p>
              </div>

              <div className="rounded-lg border border-border-subtle bg-surface-bg p-4">
                <p className="text-sm text-muted">Tutors</p>
                <p className="mt-2 text-2xl font-bold text-ink">
                  186
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle">
                  <div className="h-full w-[42%] rounded-full bg-brand-primary" />
                </div>

                <p className="mt-2 text-xs text-muted">
                  14.5% of users
                </p>
              </div>

              <div className="rounded-lg border border-border-subtle bg-surface-bg p-4">
                <p className="text-sm text-muted">Multi-role users</p>
                <p className="mt-2 text-2xl font-bold text-ink">
                  74
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle">
                  <div className="h-full w-[28%] rounded-full bg-olive" />
                </div>

                <p className="mt-2 text-xs text-muted">
                  Tutor + student
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-border-subtle pt-5">
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-bg">
                  Manage users
                </button>

                <button className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-bg">
                  Suspended accounts
                </button>

                <button className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-bg">
                  Multi-role users
                </button>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
            <SectionHeader
              title="Tutor Verification"
              description="Tutors waiting for approval."
              action="Review all"
            />

            <TutorApplications />
          </div>
        </section>

        {/* =================================================
            SESSION & BOOKING OVERSIGHT
        ================================================= */}

        <section>
          <SectionHeader
            title="Session & Booking Oversight"
            description="Monitor the current tutoring marketplace activity."
            action="View all bookings"
          />

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {bookingStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border-subtle bg-surface-card p-4 shadow-warm"
              >
                <p className="text-sm text-muted">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-ink">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-warm">
            <div className="border-b border-border-subtle px-5 py-4">
              <h3 className="font-semibold text-ink">
                Today's Sessions
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-surface-bg">
                  <tr className="border-b border-border-subtle">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Time
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Student
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Tutor
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Subject
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {upcomingSessions.map((session) => (
                    <tr
                      key={`${session.time}-${session.student}`}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-ink">
                        {session.time}
                      </td>

                      <td className="px-5 py-4 text-sm text-ink">
                        {session.student}
                      </td>

                      <td className="px-5 py-4 text-sm text-ink">
                        {session.tutor}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted">
                        {session.subject}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={session.status as "CONFIRMED" | "PENDING"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =================================================
            FINANCIAL OVERVIEW
        ================================================= */}

        <section>
          <SectionHeader
            title="Financial & Payout Control"
            description="Platform revenue, commissions, escrow, and payout monitoring."
            action="Open financial center"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <p className="text-sm text-muted">Total sales</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                $48,620
              </p>
              <p className="mt-2 text-xs font-semibold text-success">
                +12.8% this month
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <p className="text-sm text-muted">Platform commission</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                $7,293
              </p>
              <p className="mt-2 text-xs text-muted">
                15% average commission
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <p className="text-sm text-muted">Held in escrow</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                $4,820
              </p>
              <p className="mt-2 text-xs text-muted">
                Awaiting session completion
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <p className="text-sm text-muted">Pending payouts</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                $3,140
              </p>
              <p className="mt-2 text-xs text-muted">
                28 tutor payouts
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-ink">
                  Promo Engine
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Manage discount codes and referral bonuses.
                </p>
              </div>

              <div className="flex gap-3">
                <button className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-bg">
                  View promotions
                </button>

                <button className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover">
                  Create promo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            QUALITY ASSURANCE
        ================================================= */}

        <section>
          <SectionHeader
            title="Quality Assurance & Moderation"
            description="Review reports, disputes, ratings, and platform activity."
            action="Open moderation center"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">
                  Review moderation
                </p>

                <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                  12
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-ink">
                Pending
              </p>

              <p className="mt-1 text-xs text-muted">
                Reviews requiring attention
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">
                  Report tickets
                </p>

                <span className="rounded-full bg-error/10 px-2.5 py-1 text-xs font-semibold text-error">
                  7
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-ink">
                Open
              </p>

              <p className="mt-1 text-xs text-muted">
                User-submitted reports
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">
                  Disputes
                </p>

                <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                  4
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-ink">
                Active
              </p>

              <p className="mt-1 text-xs text-muted">
                Requiring resolution
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">
                  Chat monitoring
                </p>

                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  Good
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-ink">
                99.2%
              </p>

              <p className="mt-1 text-xs text-muted">
                Messages without flags
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Growth Metrics */}
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
            <SectionHeader
              title="Growth Metrics"
              description="Marketplace growth and user activity."
            />

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-lg bg-surface-bg p-4">
                <p className="text-xs text-muted">
                  Monthly active users
                </p>

                <p className="mt-2 text-2xl font-bold text-ink">
                  1,026
                </p>

                <p className="mt-1 text-xs font-semibold text-success">
                  +14.6%
                </p>
              </div>

              <div className="rounded-lg bg-surface-bg p-4">
                <p className="text-xs text-muted">
                  New sign-ups
                </p>

                <p className="mt-2 text-2xl font-bold text-ink">
                  184
                </p>

                <p className="mt-1 text-xs font-semibold text-success">
                  +9.3%
                </p>
              </div>

              <div className="rounded-lg bg-surface-bg p-4">
                <p className="text-xs text-muted">
                  Repeat bookings
                </p>

                <p className="mt-2 text-2xl font-bold text-ink">
                  68.4%
                </p>

                <p className="mt-1 text-xs text-muted">
                  Student retention
                </p>
              </div>

              <div className="rounded-lg bg-surface-bg p-4">
                <p className="text-xs text-muted">
                  Avg. sessions / student
                </p>

                <p className="mt-2 text-2xl font-bold text-ink">
                  4.7
                </p>

                <p className="mt-1 text-xs text-muted">
                  This month
                </p>
              </div>
            </div>
          </div>

          {/* Subject Demand */}
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
            <SectionHeader
              title="Subject Demand"
              description="Most requested tutoring subjects."
              action="Manage subjects"
            />

            <div className="space-y-5">
              {subjectDemand.map((subject) => (
                <div key={subject.subject}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-ink">
                      {subject.subject}
                    </span>

                    <span className="text-xs text-muted">
                      {subject.bookings} bookings
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                    <div
                      className="h-full rounded-full bg-brand-primary"
                      style={{
                        width: `${subject.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            TUTOR PERFORMANCE
        ================================================= */}

        <section>
          <SectionHeader
            title="Tutor Performance"
            description="Top tutors based on ratings, sessions, and earnings."
            action="View tutor analytics"
          />

          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-warm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-surface-bg">
                  <tr className="border-b border-border-subtle">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Rank
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Tutor
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Subject
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Rating
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Sessions
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Earnings
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topTutors.map((tutor, index) => (
                    <tr
                      key={tutor.name}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="px-5 py-4">
                        <span className="font-serif text-lg font-bold text-brand-primary">
                          #{index + 1}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-ink">
                        {tutor.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted">
                        {tutor.subject}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-ink">
                          ★ {tutor.rating}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-ink">
                        {tutor.sessions}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-ink">
                        {tutor.earnings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT & PLATFORM SETTINGS
        ================================================= */}

        <section>
          <SectionHeader
            title="Content & Platform Settings"
            description="Quick access to the main administrative configuration areas."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <button className="group rounded-xl border border-border-subtle bg-surface-card p-5 text-left shadow-warm transition hover:-translate-y-0.5 hover:border-brand-primary">
              <p className="text-sm font-semibold text-ink">
                CMS Tools
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Update FAQs, landing page content, and privacy policies.
              </p>

              <p className="mt-4 text-sm font-semibold text-brand-primary">
                Manage content →
              </p>
            </button>

            <button className="group rounded-xl border border-border-subtle bg-surface-card p-5 text-left shadow-warm transition hover:-translate-y-0.5 hover:border-brand-primary">
              <p className="text-sm font-semibold text-ink">
                Subject Taxonomy
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Add, remove, and organize academic subjects and skills.
              </p>

              <p className="mt-4 text-sm font-semibold text-brand-primary">
                Manage subjects →
              </p>
            </button>

            <button className="group rounded-xl border border-border-subtle bg-surface-card p-5 text-left shadow-warm transition hover:-translate-y-0.5 hover:border-brand-primary">
              <p className="text-sm font-semibold text-ink">
                Pricing Controls
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Configure commissions and hourly rate limits.
              </p>

              <p className="mt-4 text-sm font-semibold text-brand-primary">
                Configure pricing →
              </p>
            </button>

            <button className="group rounded-xl border border-border-subtle bg-surface-card p-5 text-left shadow-warm transition hover:-translate-y-0.5 hover:border-brand-primary">
              <p className="text-sm font-semibold text-ink">
                Notifications
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Configure email, SMS, and push notification triggers.
              </p>

              <p className="mt-4 text-sm font-semibold text-brand-primary">
                Configure alerts →
              </p>
            </button>
          </div>
        </section>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <section>
          <SectionHeader
            title="Recent Platform Activity"
            description="Latest actions across the marketplace."
            action="View activity log"
          />

          <div className="rounded-xl border border-border-subtle bg-surface-card shadow-warm">
            <div className="divide-y divide-border-subtle">
              {recentActivity.map((activity) => (
                <div
                  key={`${activity.action}-${activity.user}`}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
                    {activity.type === "user" && "U"}
                    {activity.type === "verification" && "V"}
                    {activity.type === "booking" && "B"}
                    {activity.type === "warning" && "!"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {activity.action}
                    </p>

                    <p className="mt-0.5 text-xs text-muted">
                      {activity.user}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}