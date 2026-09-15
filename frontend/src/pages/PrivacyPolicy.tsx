import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  Database,
  Download,
  ArrowLeft,
  CheckCircle2,
  Mail,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Clock3,
} from "lucide-react";
import { Footer } from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";

export const PrivacyPolicy: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("intro");

  const sections = [
    { id: "intro", title: "1. Introduction & Overview" },
    { id: "collection", title: "2. Information We Collect" },
    { id: "usage", title: "3. How We Use Your Data" },
    { id: "visibility", title: "4. Peer Visibility & Privacy" },
    { id: "chat", title: "5. Real-Time Chat & Messages" },
    { id: "documents", title: "6. Credentials & File Uploads" },
    { id: "security", title: "7. Security & Encryption" },
    { id: "storage", title: "8. Storage & Cookies" },
    { id: "rights", title: "9. Your Rights & Data Control" },
    { id: "honor-code", title: "10. Academic Integrity & Conduct" },
    { id: "contact", title: "11. Contact & Support" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-ink">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 transition-transform hover:scale-[1.02]"
              aria-label="Tutorium Home"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-brand-primary tracking-tight">
                Tutorium
              </span>
            </Link>

            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-muted bg-gray-100 px-2.5 py-1 rounded-full">
              Legal & Privacy
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-ink border border-border-subtle rounded-md hover:bg-gray-50 transition-colors"
              title="Print or save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              Print / PDF
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover shadow-sm transition-colors"
              >
                Go to Dashboard
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border-subtle bg-gradient-to-b from-blue-50/50 via-surface-card to-surface-bg py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Trust & Transparency at Tutorium
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            We are dedicated to safeguarding the privacy and personal data of every student, peer tutor, and educator on the Tutorium academic network.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5 text-slate-blue" />
              Last Updated: September 16, 2024
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-olive" />
              Version 1.2
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-burgundy" />
              Applies to Students, Tutors & Visitors
            </span>
          </div>
        </div>
      </section>

      {/* 4 Key Privacy Principles Cards */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm hover:border-slate-blue/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-slate-blue flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-ink mb-1">Zero Data Selling</h2>
            <p className="text-xs text-muted leading-relaxed">
              We will never sell, lease, or monetize your study records, transcripts, or personal data to third-party advertisers.
            </p>
          </div>

          <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm hover:border-olive/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-olive flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-ink mb-1">Peer Role Privacy</h2>
            <p className="text-xs text-muted leading-relaxed">
              Only required academic info is visible to confirmed peers. Sensitive documents remain confidential and admin-restricted.
            </p>
          </div>

          <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm hover:border-burgundy/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-ink mb-1">Secured Real-Time Chat</h2>
            <p className="text-xs text-muted leading-relaxed">
              All messaging is isolated to conversation participants with verified JWT room membership over encrypted WebSocket sockets.
            </p>
          </div>

          <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm hover:border-brand-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-brand-primary flex items-center justify-center mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-ink mb-1">Full User Ownership</h2>
            <p className="text-xs text-muted leading-relaxed">
              You retain total control over your profile. Update, export, or request permanent deletion of your account at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area with Sticky Sidebar */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block sticky top-24 bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Table of Contents
            </h2>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                    activeSection === sec.id
                      ? "bg-blue-50 text-brand-primary font-semibold"
                      : "text-muted hover:text-ink hover:bg-gray-50"
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-border-subtle">
              <p className="text-[11px] text-muted leading-tight mb-2">
                Need clarification on any policy term?
              </p>
              <a
                href="mailto:support@tutorium.edu"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact Privacy Team
              </a>
            </div>
          </aside>

          {/* Policy Text Content */}
          <div className="space-y-10 bg-surface-card border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-sm leading-relaxed text-sm">
            {/* Section 1 */}
            <article id="intro" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <BookOpen className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">1. Introduction & Overview</h2>
              </div>
              <p className="text-muted">
                Welcome to <strong>Tutorium</strong> ("we," "our," or "the Platform"). Tutorium is an academic peer-to-peer marketplace designed to connect university students with qualified peer tutors who have mastered university-level coursework.
              </p>
              <p className="text-muted">
                This Privacy Policy explains how Tutorium collects, uses, discloses, and safeguards your personal data when you visit our website, register an account, publish tutor availability, schedule tutoring bookings, communicate over our real-time messaging system, or submit academic credentials.
              </p>
              <div className="bg-blue-50/60 border-l-4 border-slate-blue p-4 rounded-r-lg text-xs text-ink space-y-1">
                <span className="font-bold text-slate-blue">Our Educational Mission:</span>
                <p className="text-muted">
                  We treat academic privacy as a fundamental right. Your data is used exclusively to foster legitimate learning collaborations, maintain academic integrity, and facilitate virtual tutoring sessions.
                </p>
              </div>
            </article>

            {/* Section 2 */}
            <article id="collection" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <Database className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">2. Information We Collect</h2>
              </div>
              <p className="text-muted">
                We collect personal information that you provide directly to us when setting up an account or utilizing marketplace features:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-surface-bg p-4 rounded-xl border border-border-subtle space-y-2">
                  <span className="font-semibold text-ink text-xs uppercase tracking-wider block">
                    A. Student Profiles
                  </span>
                  <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                    <li>Full name, university email address, and account credentials</li>
                    <li>Education level (e.g., 2nd-year undergraduate) and major</li>
                    <li>Learning goals and preferred academic subjects</li>
                    <li>Learning style preferences and target hourly budget</li>
                    <li>Timezone preferences for session synchronization</li>
                  </ul>
                </div>

                <div className="bg-surface-bg p-4 rounded-xl border border-border-subtle space-y-2">
                  <span className="font-semibold text-ink text-xs uppercase tracking-wider block">
                    B. Tutor Profiles
                  </span>
                  <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                    <li>Professional headline, bio, and academic background</li>
                    <li>Hourly rate settings and list of taught university courses</li>
                    <li>Spoken languages and virtual meeting room URLs (Google Meet/Zoom)</li>
                    <li>Video introduction links and verified qualifications</li>
                    <li>Cumulative ratings and student review history</li>
                  </ul>
                </div>
              </div>

              <div className="bg-surface-bg p-4 rounded-xl border border-border-subtle space-y-2 mt-3">
                <span className="font-semibold text-ink text-xs uppercase tracking-wider block">
                  C. Booking, Scheduling & Session Data
                </span>
                <p className="text-xs text-muted">
                  When tutors publish availability or students confirm sessions, we record time slots, course subjects, pricing calculations, session statuses (<code>PENDING</code>, <code>CONFIRMED</code>, <code>COMPLETED</code>, <code>CANCELLED</code>), and optional session preparation notes.
                </p>
              </div>
            </article>

            {/* Section 3 */}
            <article id="usage" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <CheckCircle2 className="w-5 h-5 text-olive" />
                <h2 className="text-xl font-bold font-serif">3. How We Use Your Data</h2>
              </div>
              <p className="text-muted">
                Tutorium processes personal data under lawful bases, including platform performance, legitimate academic interest, and user consent:
              </p>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-blue mt-2 shrink-0" />
                  <span><strong>Scheduling & Session Delivery:</strong> Powering our conflict-free calendar grid, matching students with tutors, and generating meeting links.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-blue mt-2 shrink-0" />
                  <span><strong>Tutor Credential Auditing:</strong> Enabling platform administrators to review submitted certificates and transcripts before granting verified tutor status.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-blue mt-2 shrink-0" />
                  <span><strong>Real-Time Messaging:</strong> Delivering instant notifications, course discussion threads, and peer consultation updates via WebSocket channels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-blue mt-2 shrink-0" />
                  <span><strong>Marketplace Integrity:</strong> Calculating transparent average ratings and review metrics from verified completed bookings.</span>
                </li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="visibility" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <Eye className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">4. Peer Visibility & Privacy Boundaries</h2>
              </div>
              <p className="text-muted">
                To guarantee student and tutor safety, Tutorium enforces strict data visibility tiers across the application:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-border-subtle rounded-lg overflow-hidden">
                  <thead className="bg-surface-bg border-b border-border-subtle text-ink font-semibold">
                    <tr>
                      <th className="p-3">Data Field</th>
                      <th className="p-3">Public / Search Directory</th>
                      <th className="p-3">Confirmed Session Peer</th>
                      <th className="p-3">Platform Admins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-muted">
                    <tr>
                      <td className="p-3 font-medium text-ink">Tutor Headline, Bio, Rate</td>
                      <td className="p-3 text-emerald-600 font-medium">Visible</td>
                      <td className="p-3 text-emerald-600 font-medium">Visible</td>
                      <td className="p-3 text-emerald-600 font-medium">Visible</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-ink">Virtual Meeting Room URL</td>
                      <td className="p-3 text-red-500 font-medium">Hidden</td>
                      <td className="p-3 text-emerald-600 font-medium">Visible (Upon Confirmation)</td>
                      <td className="p-3 text-emerald-600 font-medium">Visible</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-ink">Certificate & Transcripts</td>
                      <td className="p-3 text-red-500 font-medium">Hidden</td>
                      <td className="p-3 text-red-500 font-medium">Hidden</td>
                      <td className="p-3 text-emerald-600 font-medium">Visible (Auditing Only)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-ink">Direct Chat History</td>
                      <td className="p-3 text-red-500 font-medium">Hidden</td>
                      <td className="p-3 text-emerald-600 font-medium">Sender & Receiver Only</td>
                      <td className="p-3 text-red-500 font-medium">Hidden (Unless Flagged)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Section 5 */}
            <article id="chat" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <MessageSquare className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">5. Real-Time Chat & Communications Privacy</h2>
              </div>
              <p className="text-muted">
                Our in-app messaging engine is built on Socket.io and PostgreSQL. Here is how your discussions remain private:
              </p>
              <ul className="space-y-2 text-muted list-disc list-inside">
                <li><strong>Token Handshake Verification:</strong> Socket clients must supply a valid JWT token signed by our auth server during the handshake before establishing a connection.</li>
                <li><strong>Room Isolation:</strong> Sockets only join rooms corresponding to explicit <code>ConversationParticipant</code> records. Non-members cannot subscribe or snoop on conversations.</li>
                <li><strong>Encrypted Transport:</strong> All real-time message payloads and attachments travel through secure WebSocket (WSS) and HTTPS protocols.</li>
                <li><strong>Soft Deletion:</strong> When a user deletes a message, it is marked with a <code>deletedAt</code> timestamp and omitted from future conversation queries.</li>
              </ul>
            </article>

            {/* Section 6 */}
            <article id="documents" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <FileText className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">6. Credentials & File Uploads</h2>
              </div>
              <p className="text-muted">
                When applying to become a peer tutor via <code>/become-a-tutor</code>, applicants may upload supporting materials such as university transcripts, certifications, and qualification proof:
              </p>
              <div className="bg-surface-bg p-4 rounded-xl border border-border-subtle space-y-2 text-xs text-muted">
                <p>
                  <strong>Secure Cloud Storage:</strong> Uploads are processed through Multer and saved in dedicated, access-controlled Supabase Storage buckets.
                </p>
                <p>
                  <strong>Administrative Audit Only:</strong> Certification files are visible exclusively to the applicant and verified system administrators for application review (<code>/admin/tutor-approvals</code>).
                </p>
                <p>
                  <strong>Retention & Removal:</strong> If an application is rejected or an account is closed, uploaded qualification files may be permanently scrubbed from cloud storage upon request.
                </p>
              </div>
            </article>

            {/* Section 7 */}
            <article id="security" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <Lock className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">7. Security & Encryption Standards</h2>
              </div>
              <p className="text-muted">
                We implement industry-standard administrative, physical, and technical safeguards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface-bg border border-border-subtle rounded-lg">
                  <span className="font-semibold text-ink block mb-1">🔐 Password Hashing</span>
                  <p className="text-muted">All passwords are salted and hashed using bcrypt (10 rounds) before database storage. Plaintext passwords are never stored or logged.</p>
                </div>
                <div className="p-3 bg-surface-bg border border-border-subtle rounded-lg">
                  <span className="font-semibold text-ink block mb-1">🎫 JWT Authentication</span>
                  <p className="text-muted">Stateless JSON Web Tokens with expiration timestamps validate incoming API requests and prevent unauthorized impersonation.</p>
                </div>
                <div className="p-3 bg-surface-bg border border-border-subtle rounded-lg">
                  <span className="font-semibold text-ink block mb-1">🛡️ Parameterized SQL</span>
                  <p className="text-muted">Prisma ORM automatically executes parameterized queries against our PostgreSQL database, completely mitigating SQL injection risks.</p>
                </div>
                <div className="p-3 bg-surface-bg border border-border-subtle rounded-lg">
                  <span className="font-semibold text-ink block mb-1">🌐 Strict CORS Policy</span>
                  <p className="text-muted">Our Express backend enforces explicit origin checking, accepting requests only from authorized platform web client origins.</p>
                </div>
              </div>
            </article>

            {/* Section 8 */}
            <article id="storage" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <Calendar className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">8. Storage, Sessions & Cookies</h2>
              </div>
              <p className="text-muted">
                Tutorium prioritizes user privacy by minimizing cookie usage:
              </p>
              <ul className="space-y-1.5 text-muted text-xs list-disc list-inside">
                <li><strong>Browser LocalStorage:</strong> Used to maintain your active authentication session (<code>token</code>) and persist your chosen active role (<code>tutorium-active-role</code>).</li>
                <li><strong>No Advertising Cookies:</strong> We do not deploy third-party advertising trackers or ad networks that monitor your browsing activity across other websites.</li>
                <li><strong>Session Expiry:</strong> Logging out clears stored tokens and destroys active socket connections immediately.</li>
              </ul>
            </article>

            {/* Section 9 */}
            <article id="rights" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <Shield className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">9. Your Rights & Data Control</h2>
              </div>
              <p className="text-muted">
                As a Tutorium member, you have full ownership of your data, including:
              </p>
              <div className="space-y-2 text-xs text-muted">
                <p><strong>• Access & Modification:</strong> You can edit your major, bio, hourly rate, and subjects directly through <Link to="/profile" className="text-brand-primary font-medium hover:underline">Student Profile</Link> and <Link to="/tutor-profile" className="text-brand-primary font-medium hover:underline">Tutor Profile</Link> pages.</p>
                <p><strong>• Credential Updates:</strong> You can change your password at any time within <Link to="/settings" className="text-brand-primary font-medium hover:underline">Account Settings</Link>.</p>
                <p><strong>• Deletion / Right to be Forgotten:</strong> You may request permanent deletion of your account, profile, and associated history by writing to our data protection team.</p>
              </div>
            </article>

            {/* Section 10 */}
            <article id="honor-code" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <GraduationCap className="w-5 h-5 text-burgundy" />
                <h2 className="text-xl font-bold font-serif">10. Academic Integrity & Conduct</h2>
              </div>
              <p className="text-muted">
                Tutorium is designed to foster collaborative peer learning, conceptual understanding, and exam preparation. We strictly prohibit:
              </p>
              <ul className="space-y-1.5 text-muted text-xs list-disc list-inside">
                <li>Using marketplace chat or video sessions for exam cheating, ghostwriting, or academic fraud.</li>
                <li>Sharing copyrighted university exam sheets, answer keys, or confidential grading rubrics.</li>
                <li>Harassment, discriminatory language, or abusive behavior between peers.</li>
              </ul>
              <p className="text-xs text-muted">
                Violations of this honor code will result in immediate suspension of tutor verification or account termination.
              </p>
            </article>

            {/* Section 11 */}
            {/* <article id="contact" className="scroll-mt-24 space-y-4 border-t border-border-subtle pt-8">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <Mail className="w-5 h-5 text-slate-blue" />
                <h2 className="text-xl font-bold font-serif">11. Contact & Support</h2>
              </div>
              <p className="text-muted">
                If you have questions, feedback, or data privacy requests regarding this policy, please reach out to our team:
              </p>
              <div className="bg-surface-bg border border-border-subtle rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-ink">
                  <Mail className="w-4 h-4 text-slate-blue" />
                  <span><strong>Email:</strong> <a href="mailto:privacy@tutorium.edu" className="text-brand-primary hover:underline">privacy@tutorium.edu</a> / <a href="mailto:support@tutorium.edu" className="text-brand-primary hover:underline">support@tutorium.edu</a></span>
                </div>
                <div className="flex items-center gap-2 text-ink">
                  <ExternalLink className="w-4 h-4 text-slate-blue" />
                  <span><strong>Response Time:</strong> Our administrative compliance team responds to all data requests within 48 business hours.</span>
                </div>
              </div>
            </article> */}

            {/* Back to top button */}
            <div className="pt-6 border-t border-border-subtle flex justify-between items-center text-xs text-muted">
              <span>© {new Date().getFullYear()} Tutorium Academic Network. All rights reserved.</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-brand-primary font-semibold hover:underline"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
