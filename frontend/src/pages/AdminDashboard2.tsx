/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  Users, Calendar, DollarSign, ShieldCheck, BarChart3, Settings, 
  TrendingUp, AlertTriangle, CheckCircle2, Star, MessageSquare, 
  FileText, BookOpen, CreditCard, Activity, ArrowUpRight, Search,
  Ban} from 'lucide-react';

// Note: This component uses `lucide-react` for icons. 
// Ensure it is installed in your project: `npm install lucide-react`

export default function AdminDashboardOverview() {
  return (
    <main className="p-6 lg:p-8 bg-surface-bg min-h-screen font-sans text-ink">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-primary">Dashboard Overview</h1>
          <p className="text-muted mt-1">Welcome back. Here is the current state of your peer-to-peer tutoring platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search users, sessions, or tickets..." 
              className="pl-9 pr-4 py-2 bg-surface-card border border-border-subtle rounded-lg text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-64"
            />
          </div>
          <button className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary-hover transition-colors shadow-warm-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </header>

      {/* Top KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total Revenue (MTD)" value="$42,580" change="+12.5%" icon={DollarSign} />
        <KpiCard label="Active Sessions Today" value="142" change="+4.2%" icon={Calendar} />
        <KpiCard label="Monthly Active Users" value="8,249" change="+8.1%" icon={Users} />
        <KpiCard label="Pending Verifications" value="12" change="-2" icon={ShieldCheck} trend="down" />
      </section>

      {/* Main Widgets Grid - Row 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Widget title="Session & Booking Oversight" icon={Calendar} className="lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-ink">Live Schedule & Cancellations</h3>
              <button className="text-xs text-brand-primary hover:underline font-medium">View Full Schedule</button>
            </div>
            <SessionItem status="ACTIVE" student="Alice M." tutor="Dr. Smith" time="10:00 AM" subject="Calculus II" />
            <SessionItem status="DISPUTED" student="John D." tutor="Sarah L." time="09:00 AM" subject="Quantum Physics" lateCancel={true} />
            <SessionItem status="UPCOMING" student="Emma W." tutor="Mike T." time="11:30 AM" subject="Conversational English" />
            <SessionItem status="COMPLETED" student="Leo K." tutor="Dr. Aris" time="08:00 AM" subject="Organic Chemistry" />
          </div>
        </Widget>

        <Widget title="User Management" icon={Users}>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-ink">Verification Queue</h3>
            </div>
            <VerificationItem name="Elena R." type="Tutor Background Check" />
            <VerificationItem name="Marcus J." type="Identity & Certification" />
            
            <div className="pt-4 border-t border-border-subtle mt-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Dual-Role Activity</p>
              <div className="flex items-center gap-3 p-2 hover:bg-surface-bg rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy text-xs font-bold">SJ</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">Samuel J.</p>
                  <p className="text-xs text-muted">Tutor ↔ Student • 3 active bookings</p>
                </div>
                <button className="text-xs text-brand-primary font-medium hover:underline">Monitor</button>
              </div>
            </div>
          </div>
        </Widget>
      </section>

      {/* Main Widgets Grid - Row 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Widget title="Analytics & Reporting" icon={BarChart3} className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Subject Demand vs. Oversaturation</h3>
            </div>
            
            <div className="flex items-end gap-6 h-40 mb-6">
              <Bar label="Math" value={85} color="bg-olive" />
              <Bar label="Coding" value={70} color="bg-slate-blue" />
              <Bar label="Science" value={60} color="bg-brand-primary" />
              <Bar label="Languages" value={45} color="bg-burgundy" />
              <Bar label="History" value={20} color="bg-muted" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
              <div className="bg-surface-bg p-3 rounded-lg border border-border-subtle">
                <p className="text-xs text-muted">Retention Rate</p>
                <p className="text-lg font-bold text-ink font-serif">68.4%</p>
                <p className="text-[10px] text-success font-medium">+2.1% LTV increase</p>
              </div>
              <div className="bg-surface-bg p-3 rounded-lg border border-border-subtle">
                <p className="text-xs text-muted">AI Matchmaking</p>
                <p className="text-lg font-bold text-ink font-serif">82%</p>
                <p className="text-[10px] text-muted font-medium">Connection success</p>
              </div>
            </div>
          </div>
        </Widget>

        <Widget title="Quality Assurance" icon={ShieldCheck}>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-ink">Moderation & Disputes</h3>
            </div>
            <ReportItem type="Harassment Claim" user="User_992" status="URGENT" />
            <ReportItem type="Off-platform Payment" user="Tutor_441" status="REVIEW" />
            <ReportItem type="Spam Message" user="User_112" status="NEW" />
            
            <button className="w-full mt-4 text-center text-sm font-medium text-brand-primary hover:bg-brand-primary/5 py-2.5 rounded-lg border border-border-subtle transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Open Dispute & Chat Logs Center
            </button>
          </div>
        </Widget>
      </section>

      {/* Main Widgets Grid - Row 3 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Widget title="Financial & Payout Control" icon={DollarSign}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-surface-bg p-4 rounded-lg border border-border-subtle">
              <p className="text-xs text-muted mb-1">Escrow Balance</p>
              <p className="text-xl font-bold text-brand-primary font-serif">$12,450</p>
              <p className="text-[10px] text-success mt-1">Securely held</p>
            </div>
            <div className="bg-surface-bg p-4 rounded-lg border border-border-subtle">
              <p className="text-xs text-muted mb-1">Pending Payouts</p>
              <p className="text-xl font-bold text-olive font-serif">$8,200</p>
              <p className="text-[10px] text-muted mt-1">Stripe/PayPal</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border-subtle">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Promo Engine</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-2 bg-surface-bg rounded-lg border border-border-subtle">
                <span className="font-mono text-xs bg-charcoal text-white px-2 py-1 rounded">SUMMER20</span>
                <span className="text-success text-xs font-medium">Active • 142 uses</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 bg-surface-bg rounded-lg border border-border-subtle">
                <span className="font-mono text-xs bg-muted text-white px-2 py-1 rounded">REFERRAL50</span>
                <span className="text-muted text-xs font-medium">Expired</span>
              </div>
            </div>
          </div>
        </Widget>

        <Widget title="Tutor Leaderboard" icon={Star}>
          <div className="space-y-3">
            <LeaderboardItem rank={1} name="Dr. Aris Thorne" subject="Quantum Physics" rating={4.98} earnings="$4,250" />
            <LeaderboardItem rank={2} name="Sarah Jenkins" subject="Calculus II" rating={4.95} earnings="$3,800" />
            <LeaderboardItem rank={3} name="Marcus Wei" subject="Organic Chemistry" rating={4.92} earnings="$3,450" />
            <button className="w-full mt-2 text-center text-sm text-brand-primary hover:underline font-medium pt-2">
              View Full Performance Metrics
            </button>
          </div>
        </Widget>

        <Widget title="Content & Platform Settings" icon={Settings}>
          <div className="space-y-2">
            <SettingsLink icon={FileText} label="CMS Tools" desc="Update FAQs & Landing page" />
            <SettingsLink icon={BookOpen} label="Subject Taxonomy" desc="Manage 48 academic categories" />
            <SettingsLink icon={CreditCard} label="Pricing Controls" desc="Global commission: 15%" />
            <SettingsLink icon={Activity} label="Notification Center" desc="Configure Email, SMS & Push" />
          </div>
        </Widget>
      </section>
    </main>
  );
}

// --- Subcomponents ---

const Widget = ({ title, icon: Icon, children, className = '' }: any) => (
  <div className={`bg-surface-card border border-border-subtle rounded-xl shadow-warm p-6 flex flex-col ${className}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 bg-surface-bg border border-border-subtle rounded-lg">
        <Icon className="w-5 h-5 text-brand-primary" />
      </div>
      <h2 className="font-serif font-semibold text-lg text-ink">{title}</h2>
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const KpiCard = ({ label, value, change, icon: Icon, trend = 'up' }: any) => (
  <div className="bg-surface-card border border-border-subtle rounded-xl shadow-warm-sm p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-muted">{label}</span>
      <div className="p-2 bg-surface-bg rounded-lg border border-border-subtle">
        <Icon className="w-4 h-4 text-brand-secondary" />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-ink font-serif">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        <TrendingUp className={`w-3 h-3 ${trend === 'up' ? 'text-success' : 'text-error rotate-180'}`} />
        <span className={`text-xs font-medium ${trend === 'up' ? 'text-success' : 'text-error'}`}>{change}</span>
        <span className="text-xs text-muted ml-1">vs last month</span>
      </div>
    </div>
  </div>
);

const SessionItem = ({ status, student, tutor, time, subject, lateCancel }: any) => {
  const safeStatusColors: any = {
    ACTIVE: 'bg-success/10 text-success',
    DISPUTED: 'bg-error/10 text-error',
    UPCOMING: 'bg-brand-primary/10 text-brand-primary',
    COMPLETED: 'bg-muted/10 text-muted'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-surface-bg rounded-lg border border-border-subtle">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-success' : status === 'DISPUTED' ? 'bg-error' : 'bg-slate-blue'}`}></div>
        <div>
          <p className="text-sm font-semibold text-ink">{subject}</p>
          <p className="text-xs text-muted">{student} <span className="mx-1">•</span> {tutor}</p>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <p className="text-xs font-medium text-ink">{time}</p>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${safeStatusColors[status]}`}>
            {status}
          </span>
        </div>
        {lateCancel && <AlertTriangle className="w-4 h-4 text-burgundy" />}
      </div>
    </div>
  );
};

const VerificationItem = ({ name, type }: any) => (
  <div className="flex items-center justify-between p-2 hover:bg-surface-bg rounded-lg transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-muted">{type}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button className="p-1.5 hover:bg-success/10 text-success rounded-md transition-colors" title="Approve">
        <CheckCircle2 className="w-4 h-4" />
      </button>
      <button className="p-1.5 hover:bg-error/10 text-error rounded-md transition-colors" title="Reject">
        <Ban className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const Bar = ({ label, value, color }: any) => (
  <div className="flex-1 flex flex-col items-center gap-2 h-32">
    <div className="w-full flex-1 bg-surface-bg rounded-t-md relative flex items-end border border-border-subtle border-b-0">
      <div 
        className={`w-full ${color} rounded-t-md transition-all duration-500`} 
        style={{ height: `${value}%` }}
      ></div>
    </div>
    <span className="text-[10px] font-medium text-muted uppercase">{label}</span>
  </div>
);

const ReportItem = ({ type, user, status }: any) => {
  const colors: any = {
    URGENT: 'text-burgundy bg-burgundy/10',
    REVIEW: 'text-warning bg-warning/10',
    NEW: 'text-slate-blue bg-slate-blue/10'
  };
  return (
    <div className="flex items-center justify-between p-3 border border-border-subtle rounded-lg hover:bg-surface-bg transition-colors">
      <div>
        <p className="text-sm font-medium text-ink">{type}</p>
        <p className="text-xs text-muted">Reported by {user}</p>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${colors[status]}`}>
        {status}
      </span>
    </div>
  );
};

const SettingsLink = ({ icon: Icon, label, desc }: any) => (
  <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-bg border border-transparent hover:border-border-subtle transition-all group">
    <div className="p-2 bg-surface-bg border border-border-subtle rounded-lg group-hover:bg-brand-primary group-hover:border-brand-primary transition-colors">
      <Icon className="w-4 h-4 text-brand-primary group-hover:text-white transition-colors" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="text-xs text-muted">{desc}</p>
    </div>
    <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-brand-primary transition-colors" />
  </a>
);

const LeaderboardItem = ({ rank, name, subject, rating, earnings }: any) => (
  <div className="flex items-center gap-4 p-3 bg-surface-bg rounded-lg border border-border-subtle">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
      rank === 1 ? 'bg-olive text-white' : rank === 2 ? 'bg-slate-blue text-white' : 'bg-brand-secondary text-white'
    }`}>
      {rank}
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-ink">{name}</p>
      <p className="text-xs text-muted">{subject} <span className="mx-1">•</span> ⭐ {rating}</p>
    </div>
    <p className="text-sm font-bold text-olive">{earnings}</p>
  </div>
);