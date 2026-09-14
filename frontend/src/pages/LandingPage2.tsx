import {
  Award,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock3,
  Search,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/badge";
import { Footer } from "../components/layout/Footer";

const universities = ["AUB", "LAU", "USJ", "BAU", "NDU"];
const popularSubjects = ["Mathematics", "Computer Science", "Engineering", "Chemistry", "Economics"];
const steps = [
  [
    Search,
    "Search & filter",
    "Find tutors by subject, university, price, availability, and ratings.",
  ],
  [
    Sparkles,
    "AI smart match",
    "Match your learning style and course needs with the right peer.",
  ],
  [
    Target,
    "Ace your exams",
    "Book a focused session and make meaningful progress.",
  ],
] as const;

export const LandingPage2: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    window.location.href = query
      ? `/find-tutors?search=${encodeURIComponent(query)}`
      : "/find-tutors";
  };

  return (
    <div className="min-h-screen bg-surface-bg text-ink">
      <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface-card/80">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="AcademiConnect home"
          >
          
          <div className="relative z-10 flex items-center gap-2">
            <span className="text-2xl text-blue-200">✦</span>
            <span className="font-serif text-2xl font-bold  text-blue-700">Tutorium</span>
          </div>
          </Link>
          <form
            onSubmit={handleSearch}
            className="mx-8 hidden max-w-md flex-1 md:flex"
          >
            <label className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <span className="sr-only">Search for tutors or subjects</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for tutors or subjects..."
                className="w-full rounded-sm border border-border-subtle bg-surface-bg py-2 pr-4 pl-10 text-sm shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </label>
          </form>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#edf2f6] via-surface-card to-[#f4ecec] py-16 lg:py-24">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[36px] border-slate-blue/15" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-burgundy/10 blur-3xl" />
          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm shadow-sm">
                <Sparkles className="mr-1 h-4 w-4" />
                AI-Powered Matching
              </Badge>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-burgundy">Lebanon&apos;s university tutoring marketplace</p>
              <h1 className="mb-6 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl lg:text-6xl">
                Find the right tutor for <span className="text-slate-blue">your course.</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-muted md:text-xl lg:mx-0">
                Compare trusted university peers by course, campus, availability, and experience. Get focused help from someone who understands what you&apos;re studying.
              </p>
              <form
                onSubmit={handleSearch}
                className="mx-auto mb-8 flex max-w-3xl flex-col gap-2 rounded-sm border border-border-subtle bg-surface-card p-2 shadow-xl shadow-ink/10 sm:flex-row lg:mx-0"
              >
                <label className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-blue" />
                  <span className="sr-only">Search for a course</span>
                  <Input
                    type="search"
                    placeholder='Try "Discrete Math for LAU" or "Organic Chemistry USJ"...'
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="border-0 py-3 pl-12 pr-4 text-base focus-visible:ring-0"
                  />
                </label>
                <Button type="submit" className="px-8 py-3">
                  <Search className="mr-2 h-5 w-5" />
                  Find Tutor
                </Button>
              </form>
              <p className="text-sm text-muted lg:text-left">
                Trusted by students from{" "}
                {universities.map((university, index) => (
                  <span key={university}>
                    {" "}
                    <strong className="text-ink">{university}</strong>
                    {index < universities.length - 1 ? "," : ""}
                  </span>
                ))}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted lg:justify-start">
                <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-olive" /> Verified student tutors</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-slate-blue" /> Flexible session times</span>
              </div>
              </div>
              <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
                <div className="absolute -inset-3 rotate-3 rounded-3xl bg-slate-blue/15" />
                <div className="relative rounded-sm bg-surface-card p-6 shadow-2xl shadow-ink/15 ring-1 ring-border-subtle sm:p-8">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-5">
                    <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">Your next match</p><h2 className="mt-2 text-xl font-bold text-ink">MECH 300 · Heat Transfer</h2><p className="mt-1 text-sm text-muted">AUB · Spring 2026</p></div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4e7e8] text-burgundy"><Sparkles className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-5 flex items-center gap-4 rounded-sm bg-surface-bg p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e5eadf] font-semibold text-olive">RS</div>
                    <div className="min-w-0 flex-1"><p className="font-semibold text-ink">Rami S.</p><p className="truncate text-sm text-muted">Heat transfer specialist</p></div>
                    <div className="text-right"><p className="font-bold text-burgundy">98%</p><p className="text-xs text-muted">match</p></div>
                  </div>
                  <Link to="/find-tutors" className="mt-5 flex items-center justify-between rounded-sm border border-border-subtle bg-[#f4f6f7] px-4 py-3 text-sm font-semibold text-brand-primary transition hover:border-slate-blue hover:bg-[#edf2f6]"><span className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-olive" /> Verified peer with relevant experience</span><ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border-subtle bg-surface-card py-8">
          <div className="container mx-auto flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-slate-blue" /><p className="text-sm font-semibold text-ink">Browse popular subjects</p></div>
            <div className="flex flex-wrap gap-2">
              {popularSubjects.map((subject) => <Link key={subject} to={`/find-tutors?search=${encodeURIComponent(subject)}`} className="rounded-full border border-border-subtle px-4 py-2 text-sm text-muted transition hover:border-slate-blue hover:bg-[#edf2f6] hover:text-brand-primary">{subject}</Link>)}
            </div>
          </div>
        </section>

        <section className="bg-surface-card py-20 lg:py-24" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-burgundy">Simple by design</p>
              <h2 className="mb-4 font-serif text-3xl font-semibold text-ink md:text-4xl">
                How it Works
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted">
                Simple steps to academic excellence
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map(([Icon, title, description], index) => (
                <Card
                  key={title}
                  className="border-border-subtle shadow-warm transition hover:-translate-y-1 hover:border-slate-blue hover:shadow-lg"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full ${index === 0 ? "bg-[#edf2f6] text-slate-blue" : index === 1 ? "bg-[#e5eadf] text-olive" : "bg-[#f4e7e8] text-burgundy"}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="mb-2 text-sm font-semibold text-burgundy">
                      STEP {index + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-ink">
                      {title}
                    </h3>
                    <p className="text-muted">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-surface-bg py-20 lg:py-24">
          <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#edf2f6] px-4 py-2 text-slate-blue">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-semibold">AI-POWERED</span>
              </div>
              <h2 className="mb-6 font-serif text-3xl font-semibold text-ink md:text-4xl">
                Built for the Lebanese Academic Landscape.
              </h2>
              <p className="mb-8 text-lg text-muted">
                Our AI understands the nuances of{" "}
                <strong>AUB&apos;s MECH 300 vs LAU&apos;s GNE 212</strong>. We
                prioritize peer matches from your own university because they
                know the professors, exam formats, and exact material.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-olive" />
                  <div>
                    <h4 className="font-semibold text-ink">
                      Course-Specific Matching
                    </h4>
                    <p className="text-sm text-muted">
                      Targeted help for matching course codes in your major.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 h-6 w-6 shrink-0 text-burgundy" />
                  <div>
                    <h4 className="font-semibold text-ink">
                      Professor Insights
                    </h4>
                    <p className="text-sm text-muted">
                      Learn from students who have already passed your
                      professor&apos;s class.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-sm bg-gradient-to-br from-[#e6edf2] to-[#f0e5e5] p-8">
              <div className="mx-auto max-w-sm rounded-sm border border-border-subtle bg-surface-card p-6 shadow-warm">
                <div className="mb-4 flex items-center gap-3 border-b border-border-subtle pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2f6]">
                    <Users className="h-5 w-5 text-slate-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      MATCHING ENGINE ACTIVE
                    </p>
                    <p className="text-xs text-muted">
                      Finding your perfect match...
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-sm bg-surface-bg p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e5eadf] text-xs font-semibold text-olive">
                      RS
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">Rami S.</p>
                      <p className="truncate text-xs text-muted">
                        Expert in Heat Transfer
                      </p>
                    </div>
                    <Badge className="bg-[#e5eadf] text-xs text-olive">
                      98% Match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 rounded-sm bg-surface-bg p-3 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf2f6] text-xs font-semibold text-slate-blue">
                      DK
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">Dana K.</p>
                      <p className="truncate text-xs text-muted">
                        Fluid Dynamics Specialist
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      94% Match
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4 text-sm">
                  <Shield className="h-4 w-4 text-olive" />
                  <span className="font-medium text-burgundy">98% MATCH</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-brand-primary to-slate-blue py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 font-serif text-3xl font-semibold text-white md:text-4xl">
              Join the network of academic success.
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
              Over 5,000 Lebanese students are already using AcademiConnect to
              excel in their courses.
            </p>
            <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button variant="secondary" className="px-8 py-4 text-base">
                  Get Started Now
                </Button>
              </Link>
              <Link to="/become-tutor">
                <Button
                  variant="secondary"
                  className="border-white px-8 py-4 text-base text-white hover:bg-white/10"
                >
                  Become a Tutor
                </Button>
              </Link>
            </div>
            <div className="flex justify-center gap-12 text-white">
              <div>
                <div className="text-4xl font-bold">5k+</div>
                <div className="text-sm text-white/70">Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold">12k+</div>
                <div className="text-sm text-white/70">Sessions</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage2;
