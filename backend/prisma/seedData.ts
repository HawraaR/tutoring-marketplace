import { TutorStatus, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/db";

async function main() {
  console.log("🌱 Starting database seeding for peer-to-peer CS network...");

  // 1. Clean existing data (in reverse dependency order to respect foreign keys)
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.tutorSubject.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned old data.");

  // Password hash for seed users
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // 2. Create Admin User
  await prisma.user.create({
    data: {
      email: "admin@tutormarketplace.com",
      password: hashedPassword,
      firstName: "System",
      lastName: "Admin",
      isStudent: false,
      isTutor: false,
      isAdmin: true,
    },
  });

  // 3. Create Peer Tutors + Profiles
  const tutor1 = await prisma.user.create({
    data: {
      email: "alex.tutor@example.com",
      password: hashedPassword,
      firstName: "Alex",
      lastName: "Rivera",
      isStudent: false,
      isTutor: true,
      tutorProfile: {
        create: {
          headline: "3rd-Year CS Student & Web Dev Peer Tutor",
          bio: "Hey! I'm a fellow CS student who loves helping peers grasp React, Node, and Data Structures without the headache.",
          hourlyRate: 15.0,
          education: "B.S. in Computer Science (3rd Year)",
          languages: ["English", "Arabic"],
          verificationStatus: TutorStatus.APPROVED,
          certificates: [],
          experience: ["Peer Study Group Leader", "Coding Club Mentor"],
          averageRating: 5.0,
          reviewCount: 2,
          isFeatured: true,
          meetingUrl: "https://meet.google.com/abc-alex-tutor",
        },
      },
    },
  });

  const tutor2 = await prisma.user.create({
    data: {
      email: "sarah.math@example.com",
      password: hashedPassword,
      firstName: "Sarah",
      lastName: "Chen",
      isStudent: false,
      isTutor: true,
      tutorProfile: {
        create: {
          headline: "Senior CS Student & Algorithms Mentor",
          bio: "Hey everyone! I've already aced our core algorithm and database classes, so let's study together and prep for exams.",
          hourlyRate: 20.0,
          education: "B.S. in Computer Science (Senior Year)",
          languages: ["English"],
          verificationStatus: TutorStatus.APPROVED,
          certificates: [],
          experience: ["Department Teaching Assistant for Lower-Years"],
          averageRating: 5.0,
          reviewCount: 2,
          isFeatured: true,
          meetingUrl: "https://meet.google.com/sarah-cs-room",
        },
      },
    },
  });

  // 4. Create Dual/Hybrid User (Nour: Both Student & Tutor)
  const dualUser = await prisma.user.create({
    data: {
      email: "nour.dual@example.com",
      password: hashedPassword,
      firstName: "Nour",
      lastName: "El-Amin",
      isStudent: true,
      isTutor: true,
      studentProfile: {
        create: {
          educationLevel: "Undergraduate",
          major: "Computer Science",
          learningGoals: "Mastering advanced backend architecture and database scaling.",
          preferredSubjects: ["Database Systems", "Data Structures & Algorithms"],
          learningStyle: "Hands-on Practice",
          timezone: "Asia/Beirut",
          preferredLanguage: "English",
          maxHourlyRate: 30.0,
        },
      },
      tutorProfile: {
        create: {
          headline: "CS Senior & Backend / Node Peer Tutor",
          bio: "Hey! I bridge the gap between frontend and scalable backend systems. Let's build clean REST APIs together.",
          hourlyRate: 18.0,
          education: "B.S. in Computer Science (Senior)",
          languages: ["English", "Arabic"],
          verificationStatus: TutorStatus.APPROVED,
          certificates: [],
          experience: ["Backend Lead for University Hackathon Team"],
          averageRating: 5.0,
          reviewCount: 1,
          isFeatured: true,
          meetingUrl: "https://meet.google.com/nour-backend-room",
        },
      },
    },
  });

  // 5. Create Standard Students + Profiles
  const student1 = await prisma.user.create({
    data: {
      email: "maya.student@example.com",
      password: hashedPassword,
      firstName: "Maya",
      lastName: "Khoury",
      isStudent: true,
      isTutor: false,
      studentProfile: {
        create: {
          educationLevel: "Undergraduate",
          major: "Computer Science",
          learningGoals: "Build cool projects together and prep for midterms.",
          preferredSubjects: ["Web Development (MERN Stack)", "Data Structures & Algorithms"],
          learningStyle: "Collaborative Study",
          timezone: "Asia/Beirut",
          preferredLanguage: "English",
          maxHourlyRate: 30.0,
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "liam.student@example.com",
      password: hashedPassword,
      firstName: "Liam",
      lastName: "Smith",
      isStudent: true,
      isTutor: false,
      studentProfile: {
        create: {
          educationLevel: "Undergraduate",
          major: "Computer Science",
          learningGoals: "Master database systems and practice coding problems with a peer.",
          preferredSubjects: ["Database Systems", "Data Structures & Algorithms"],
          learningStyle: "Peer Practice",
          timezone: "UTC",
          preferredLanguage: "English",
          maxHourlyRate: 30.0,
        },
      },
    },
  });

  // 6. Create Computer Science Subjects
  const mernSubject = await prisma.subject.create({
    data: {
      name: "Web Development (MERN Stack)",
      category: "Computer Science",
      description: "Building full-stack web projects with React, Node, and Express.",
    },
  });

  const dsaSubject = await prisma.subject.create({
    data: {
      name: "Data Structures & Algorithms",
      category: "Computer Science",
      description: "Core university course covering arrays, sorting, trees, and Big-O.",
    },
  });

  const dbSubject = await prisma.subject.create({
    data: {
      name: "Database Systems",
      category: "Computer Science",
      description: "Relational models, SQL, PostgreSQL, indexing, and normalization.",
    },
  });

  const backendSubject = await prisma.subject.create({
    data: {
      name: "Backend Engineering",
      category: "Computer Science",
      description: "Advanced REST APIs, architecture, authentication, and performance tuning.",
    },
  });

  // 7. Map Tutors to Subjects
  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: tutor1.id, subjectId: mernSubject.id },
      { tutorId: tutor1.id, subjectId: dsaSubject.id },
      { tutorId: tutor2.id, subjectId: dbSubject.id },
      { tutorId: tutor2.id, subjectId: dsaSubject.id },
      { tutorId: dualUser.id, subjectId: backendSubject.id },
      { tutorId: dualUser.id, subjectId: dbSubject.id },
    ],
  });

  // 8. Create Availability Slots
  const now = new Date();

  const upSlot1Date = new Date(now);
  upSlot1Date.setDate(upSlot1Date.getDate() + 1);
  upSlot1Date.setHours(14, 0, 0, 0);
  const upSlot1End = new Date(upSlot1Date);
  upSlot1End.setHours(15, 0, 0, 0);

  const slotAlexUpcoming = await prisma.availabilitySlot.create({
    data: {
      tutorId: tutor1.id,
      startTime: upSlot1Date,
      endTime: upSlot1End,
      isBooked: true,
    },
  });

  const upSlot2Date = new Date(now);
  upSlot2Date.setDate(upSlot2Date.getDate() + 2);
  upSlot2Date.setHours(16, 0, 0, 0);
  const upSlot2End = new Date(upSlot2Date);
  upSlot2End.setHours(17, 0, 0, 0);

  const slotNourUpcoming = await prisma.availabilitySlot.create({
    data: {
      tutorId: dualUser.id,
      startTime: upSlot2Date,
      endTime: upSlot2End,
      isBooked: true,
    },
  });

  // 9. Create Upcoming Bookings
  await prisma.booking.create({
    data: {
      studentId: student1.id,
      tutorId: tutor1.id,
      subjectId: mernSubject.id,
      availabilitySlotId: slotAlexUpcoming.id,
      startTime: upSlot1Date,
      endTime: upSlot1End,
      status: BookingStatus.CONFIRMED,
      totalPrice: 15.0,
      notes: "Let's review our web project structure together before submission.",
    },
  });

  await prisma.booking.create({
    data: {
      studentId: student2.id,
      tutorId: dualUser.id,
      subjectId: backendSubject.id,
      availabilitySlotId: slotNourUpcoming.id,
      startTime: upSlot2Date,
      endTime: upSlot2End,
      status: BookingStatus.CONFIRMED,
      totalPrice: 18.0,
      notes: "Going over API rate limiting and security headers.",
    },
  });

  // 10. Create Past Completed Sessions & Reviews (Including Nour as Tutor & Student)

  // Alex Past Session 1
  const alexPast1Start = new Date(now);
  alexPast1Start.setDate(alexPast1Start.getDate() - 5);
  const alexPast1End = new Date(alexPast1Start);
  alexPast1End.setHours(alexPast1End.getHours() + 1);

  const bookingAlex1 = await prisma.booking.create({
    data: {
      studentId: student2.id,
      tutorId: tutor1.id,
      subjectId: dsaSubject.id,
      startTime: alexPast1Start,
      endTime: alexPast1End,
      status: BookingStatus.COMPLETED,
      totalPrice: 15.0,
      notes: "Helped me debug my sorting algorithm implementation.",
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bookingAlex1.id,
      tutorId: tutor1.id,
      studentId: student2.id,
      rating: 5,
      comment: "Alex is a lifesaver! Explained recursion and Big-O in a way that actually clicked.",
    },
  });

  // Alex Past Session 2
  const alexPast2Start = new Date(now);
  alexPast2Start.setDate(alexPast2Start.getDate() - 2);
  const alexPast2End = new Date(alexPast2Start);
  alexPast2End.setHours(alexPast2End.getHours() + 1);

  const bookingAlex2 = await prisma.booking.create({
    data: {
      studentId: student1.id,
      tutorId: tutor1.id,
      subjectId: mernSubject.id,
      startTime: alexPast2Start,
      endTime: alexPast2End,
      status: BookingStatus.COMPLETED,
      totalPrice: 15.0,
      notes: "Worked on Express routing and middleware setup.",
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bookingAlex2.id,
      tutorId: tutor1.id,
      studentId: student1.id,
      rating: 5,
      comment: "Super helpful! We built out our API endpoints together.",
    },
  });

  // Nour's Past Session AS A TUTOR (Tutor: Nour, Student: Liam)
  const nourTutorPastStart = new Date(now);
  nourTutorPastStart.setDate(nourTutorPastStart.getDate() - 4);
  const nourTutorPastEnd = new Date(nourTutorPastStart);
  nourTutorPastEnd.setHours(nourTutorPastEnd.getHours() + 1);

  const bookingNourTutor = await prisma.booking.create({
    data: {
      studentId: student2.id, // Liam
      tutorId: dualUser.id,   // Nour
      subjectId: backendSubject.id,
      startTime: nourTutorPastStart,
      endTime: nourTutorPastEnd,
      status: BookingStatus.COMPLETED,
      totalPrice: 18.0,
      notes: "Reviewed JWT authentication and password hashing best practices.",
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bookingNourTutor.id,
      tutorId: dualUser.id,
      studentId: student2.id,
      rating: 5,
      comment: "Nour explained middleware security so clearly. Best tutoring session I've had all semester!",
    },
  });

  // Nour's Past Session AS A STUDENT (Tutor: Sarah, Student: Nour)
  const nourStudentPastStart = new Date(now);
  nourStudentPastStart.setDate(nourStudentPastStart.getDate() - 3);
  const nourStudentPastEnd = new Date(nourStudentPastStart);
  nourStudentPastEnd.setHours(nourStudentPastEnd.getHours() + 1);

  const bookingNourStudent = await prisma.booking.create({
    data: {
      studentId: dualUser.id, // Nour as student
      tutorId: tutor2.id,     // Sarah as tutor
      subjectId: dbSubject.id,
      startTime: nourStudentPastStart,
      endTime: nourStudentPastEnd,
      status: BookingStatus.COMPLETED,
      totalPrice: 20.0,
      notes: "Advanced query optimization and database indexing strategies.",
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bookingNourStudent.id,
      tutorId: tutor2.id,
      studentId: dualUser.id,
      rating: 5,
      comment: "Nour prepared great questions for our session. Super engaged and collaborative peer study!",
    },
  });

  // 11. Create Rich Chat Conversations & Extended Message Threads

  // Conversation 1: Maya & Alex
  await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: student1.id },
          { userId: tutor1.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: student1.id,
            text: "Hey Alex! Ready for our web dev session tomorrow?",
          },
          {
            senderId: tutor1.id,
            text: "Hey Maya! Yes, definitely. Bring any questions you have about the MERN stack.",
          },
        ],
      },
    },
  });

  // Conversation 2: Nour & Maya (Cross-role chat)
  await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: dualUser.id },
          { userId: student1.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: student1.id,
            text: "Hey Nour! I saw you tutor backend engineering. Are you free to review database architecture sometime next week?",
          },
          {
            senderId: dualUser.id,
            text: "Hey Maya! Absolutely, I'd love to help out. Check my schedule for availability or book a slot directly.",
          },
        ],
      },
    },
  });

  console.log("✅ Seed completed successfully with dual role user (Nour), sessions, reviews, and chats!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });