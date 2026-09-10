// src/lib/mock-tutors.ts
import type {
  AvailabilitySlot,
  Subject,
  TutorListItem,
  TutorStatus,
} from "./../../types/tutor";

export const SUBJECTS: Subject[] = [
  { id: "sub-calc", name: "Calculus III", category: "Mathematics" },
  { id: "sub-circuits", name: "Circuits 101", category: "Engineering & Tech" },
  { id: "sub-matlab", name: "MATLAB", category: "Engineering & Tech" },
  { id: "sub-python", name: "Python", category: "Engineering & Tech" },
  { id: "sub-algo", name: "Algorithms", category: "Engineering & Tech" },
  { id: "sub-micro", name: "Microeconomics", category: "Business & Economics" },
  { id: "sub-stats", name: "Statistics", category: "Business & Economics" },
  { id: "sub-bio", name: "Biology", category: "Science & Medicine" },
  {
    id: "sub-ochem",
    name: "Organic Chemistry",
    category: "Science & Medicine",
  },
  { id: "sub-phys", name: "Physics II", category: "Science & Medicine" },
];

const S = (id: string) => SUBJECTS.find((s) => s.id === id)!;

let seq = 0;
/** Next occurrence of a weekday (0=Sun…6=Sat) at a given hour, 2h long. */
function slot(
  weekday: number,
  hour: number,
  isBooked = false,
): AvailabilitySlot {
  const now = new Date();
  const delta = (weekday - now.getDay() + 7) % 7 || 7;
  const start = new Date(now);
  start.setDate(now.getDate() + delta);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(hour + 2);
  seq += 1;
  return {
    id: `slot-${seq}`,
    tutorId: "",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    isBooked,
  };
}

interface Spec {
  id: string;
  firstName: string;
  lastName: string;
  rate: number;
  education?: string;
  headline?: string;
  bio?: string;
  languages?: string[];
  status?: TutorStatus;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  subjects: string[];
  slots: [number, number][];
}

function makeTutor(t: Spec): TutorListItem {
  return {
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    tutorProfile: {
      id: `tp-${t.id}`,
      userId: t.id,
      headline: t.headline ?? null,
      bio: t.bio ?? null,
      hourlyRate: t.rate,
      education: t.education ?? null,
      languages: t.languages ?? ["English"],
      verificationStatus: t.status ?? "APPROVED",
      averageRating: t.rating ?? 0,
      reviewCount: t.reviews ?? 0,
      isFeatured: t.featured ?? false,
    },
    tutorSubjects: t.subjects.map((id) => ({
      tutorId: t.id,
      subjectId: id,
      subject: S(id),
    })),
    availability: t.slots.map(([d, h]) => ({ ...slot(d, h), tutorId: t.id })),
  };
}

export const MOCK_TUTORS: TutorListItem[] = [
  makeTutor({
    id: "t-01",
    firstName: "Rami",
    lastName: "Khoury",
    rate: 25,
    education: "AUB Senior · Electrical Engineering",
    rating: 4.9,
    reviews: 42,
    subjects: ["sub-calc", "sub-circuits", "sub-matlab"],
    slots: [
      [2, 18],
      [6, 10],
    ],
    headline:
      "Ex-Dean's List student. I simplify complex engineering concepts and lead exam prep sessions for AUB courses.",
    bio: "Ex-Dean's List student specializing in simplifying complex engineering concepts and exam prep for AUB courses.",
  }),
  makeTutor({
    id: "t-02",
    firstName: "Sara",
    lastName: "Mansour",
    rate: 30,
    education: "LAU Graduate · Economics",
    rating: 5.0,
    reviews: 128,
    featured: true,
    subjects: ["sub-micro", "sub-stats"],
    slots: [
      [1, 17],
      [3, 19],
      [6, 9],
    ],
    headline:
      "Helped 100+ students ace their finals. Patient approach with real-world examples and case studies.",
    bio: "Helped over 100 students ace their finals with a patient, real-world example driven approach.",
  }),
  makeTutor({
    id: "t-03",
    firstName: "Omar",
    lastName: "Taleb",
    rate: 15,
    education: "LU Junior · Computer Science",
    rating: 4.7,
    reviews: 18,
    subjects: ["sub-python", "sub-algo"],
    slots: [
      [2, 20],
      [4, 20],
      [6, 14],
    ],
    headline:
      "Competitive programming specialist helping peers master Python basics. Affordable rates for LU students.",
    bio: "Specializing in competitive programming and helping peers master Python basics.",
  }),
  makeTutor({
    id: "t-04",
    firstName: "Layal",
    lastName: "Haddad",
    rate: 20,
    education: "USJ Senior · Medicine",
    rating: 4.8,
    reviews: 56,
    subjects: ["sub-bio", "sub-ochem"],
    slots: [
      [3, 16],
      [0, 11],
    ],
    headline:
      "Pre-med expert. Memory techniques and conceptual understanding for high-stakes science exams.",
    bio: "Pre-med expert focused on memory techniques and conceptual understanding.",
  }),
  makeTutor({
    id: "t-05",
    firstName: "Karim",
    lastName: "Nassar",
    rate: 35,
    education: "AUB Graduate · Computer Science",
    rating: 4.9,
    reviews: 74,
    featured: true,
    languages: ["English", "Arabic", "French"],
    subjects: ["sub-python", "sub-algo", "sub-matlab"],
    slots: [
      [1, 18],
      [2, 18],
      [5, 15],
    ],
    headline:
      "Software engineer tutoring CS fundamentals, data structures and scientific computing.",
    bio: "Software engineer tutoring CS fundamentals with industry-grade best practices.",
  }),
  makeTutor({
    id: "t-06",
    firstName: "Maya",
    lastName: "Saab",
    rate: 22,
    education: "LAU Senior · Mathematics",
    rating: 4.6,
    reviews: 31,
    subjects: ["sub-calc", "sub-stats"],
    slots: [
      [4, 17],
      [6, 12],
    ],
    headline:
      "Math made intuitive — from multivariable calculus to applied statistics.",
    bio: "Making math intuitive with visual explanations and lots of practice problems.",
  }),
  makeTutor({
    id: "t-07",
    firstName: "Ali",
    lastName: "Hamdan",
    rate: 18,
    education: "LU Senior · Electrical Engineering",
    rating: 4.5,
    reviews: 12,
    subjects: ["sub-circuits", "sub-matlab"],
    slots: [[0, 13]],
    headline: "Hands-on circuits tutor with lab-demo driven sessions.",
    bio: "Hands-on circuits tutor, lab demos and past-exam drills included.",
  }),
  makeTutor({
    id: "t-08",
    firstName: "Nour",
    lastName: "Darwish",
    rate: 28,
    education: "USJ Graduate · Economics",
    rating: 4.8,
    reviews: 63,
    languages: ["English", "French"],
    subjects: ["sub-micro", "sub-stats"],
    slots: [
      [1, 10],
      [3, 10],
    ],
    headline:
      "Economics graduate covering micro theory and econometrics with clear, structured notes.",
    bio: "Structured notes, past papers, and clear explanations for econ students.",
  }),
  makeTutor({
    id: "t-09",
    firstName: "Georges",
    lastName: "Farah",
    rate: 24,
    education: "AUB Senior · Physics",
    rating: 4.7,
    reviews: 27,
    subjects: ["sub-phys", "sub-calc"],
    slots: [
      [2, 16],
      [4, 16],
    ],
    headline:
      "Physics and calculus tutor focused on problem-solving frameworks.",
    bio: "I teach problem-solving frameworks that work under exam pressure.",
  }),
  makeTutor({
    id: "t-10",
    firstName: "Tina",
    lastName: "Rahal",
    rate: 16,
    education: "LAU Junior · Biology",
    rating: 0,
    reviews: 0,
    subjects: ["sub-bio", "sub-ochem"],
    slots: [
      [5, 14],
      [6, 16],
    ],
    headline: "Friendly pre-med peer tutor — new to the platform!",
    bio: "Friendly peer tutor for intro biology and organic chemistry.",
  }),
  makeTutor({
    id: "t-11",
    firstName: "Hassan",
    lastName: "Zaiter",
    rate: 30,
    education: "LU Graduate · Computer Science",
    rating: 4.9,
    reviews: 58,
    subjects: ["sub-python", "sub-algo"],
    slots: [
      [3, 18],
      [6, 10],
    ],
    headline:
      "Algorithms and interview prep coach with 3+ years of tutoring experience.",
    bio: "Algorithms, data structures and interview prep with weekly drills.",
  }),
  makeTutor({
    id: "t-12",
    firstName: "Lea",
    lastName: "Boulos",
    rate: 20,
    education: "USJ Senior · Mathematics",
    rating: 4.6,
    reviews: 21,
    languages: ["English", "French", "Arabic"],
    subjects: ["sub-calc", "sub-stats", "sub-phys"],
    slots: [
      [1, 15],
      [0, 15],
    ],
    headline:
      "Trilingual tutor for math and physics, specializing in first-year university courses.",
    bio: "Trilingual tutor for first-year university math and physics.",
  }),
  // PENDING tutor — must NOT appear in the directory (frontend guards, backend should too)
  makeTutor({
    id: "t-13",
    firstName: "Sami",
    lastName: "Aoun",
    rate: 12,
    education: "AUB Freshman · General Studies",
    status: "PENDING",
    subjects: ["sub-calc"],
    slots: [[2, 9]],
    bio: "Awaiting verification.",
  }),
];
