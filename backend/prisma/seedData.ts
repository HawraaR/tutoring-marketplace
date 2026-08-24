import { TutorStatus, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/db";

async function main() {
  console.log("🌱 Starting database seeding for all entities...");

  // 1. Clean existing data (in reverse dependency order)
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

  // 3. Create Tutors + Profiles
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
          headline: "MSc Computer Science & Full-Stack Developer",
          bio: "5+ years of teaching React, Node.js, and Data Structures. Passionate about helping students land tech internships.",
          hourlyRate: 45.0,
          education: "M.S. in Computer Science",
          languages: ["English", "Arabic"],
          verificationStatus: TutorStatus.APPROVED,
          certificates: ["AWS Certified Solutions Architect", "Meta Front-End Developer"],
          experience: ["TA at University", "Senior Software Engineer"],
          averageRating: 4.9,
          reviewCount: 18,
          isFeatured: true,
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
          headline: "Applied Mathematics PhD & Data Science Mentor",
          bio: "Specializing in Calculus, Discrete Math, and Linear Algebra for CS majors.",
          hourlyRate: 50.0,
          education: "PhD in Mathematics",
          languages: ["English"],
          verificationStatus: TutorStatus.APPROVED,
          certificates: ["Certified Math Educator"],
          experience: ["University Lecturer - 4 Years"],
          averageRating: 5.0,
          reviewCount: 24,
          isFeatured: true,
        },
      },
    },
  });

  // 4. Create Students + Profiles
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
          learningGoals: "Master MERN stack development and prep for technical interviews.",
          preferredSubjects: ["Web Development (MERN Stack)", "Data Structures & Algorithms"],
          learningStyle: "Project-Based",
          timezone: "Asia/Beirut",
          preferredLanguage: "English",
          maxHourlyRate: 60.0,
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
          major: "Software Engineering",
          learningGoals: "Pass Calculus II and Discrete Math with top grades.",
          preferredSubjects: ["Calculus I & II", "Discrete Mathematics"],
          learningStyle: "Exam Prep",
          timezone: "UTC",
          preferredLanguage: "English",
          maxHourlyRate: 50.0,
        },
      },
    },
  });

  // 5. Create Subjects
  const mernSubject = await prisma.subject.create({
    data: {
      name: "Web Development (MERN Stack)",
      category: "Computer Science",
      description: "Full-stack development using MongoDB, Express, React, and Node.js.",
    },
  });

  const dsaSubject = await prisma.subject.create({
    data: {
      name: "Data Structures & Algorithms",
      category: "Computer Science",
      description: "Arrays, trees, graphs, sorting, dynamic programming, and Big-O notation.",
    },
  });

  const calcSubject = await prisma.subject.create({
    data: {
      name: "Calculus I & II",
      category: "Mathematics",
      description: "Limits, derivatives, integration techniques, and series.",
    },
  });

  const discreteSubject = await prisma.subject.create({
    data: {
      name: "Discrete Mathematics",
      category: "Mathematics",
      description: "Logic, set theory, proofs, combinatorics, and graph theory.",
    },
  });

  // 6. Map Tutors to Subjects (TutorSubject Junction)
  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: tutor1.id, subjectId: mernSubject.id },
      { tutorId: tutor1.id, subjectId: dsaSubject.id },
      { tutorId: tutor2.id, subjectId: calcSubject.id },
      { tutorId: tutor2.id, subjectId: discreteSubject.id },
    ],
  });

  // 7. Create Availability Slots (Upcoming Dates)
  const now = new Date();
  
  // Slot 1: Open slot for Tutor 1
  const slot1Date = new Date(now);
  slot1Date.setDate(slot1Date.getDate() + 1);
  slot1Date.setHours(14, 0, 0, 0);
  const slot1End = new Date(slot1Date);
  slot1End.setHours(15, 0, 0, 0);

  const slot1 = await prisma.availabilitySlot.create({
    data: {
      tutorId: tutor1.id,
      startTime: slot1Date,
      endTime: slot1End,
      isBooked: true, // Booked by Student 1
    },
  });

  // Slot 2: Open unbooked slot for Tutor 1
  const slot2Date = new Date(now);
  slot2Date.setDate(slot2Date.getDate() + 2);
  slot2Date.setHours(10, 0, 0, 0);
  const slot2End = new Date(slot2Date);
  slot2End.setHours(11, 0, 0, 0);

  await prisma.availabilitySlot.create({
    data: {
      tutorId: tutor1.id,
      startTime: slot2Date,
      endTime: slot2End,
      isBooked: false,
    },
  });

  // Slot 3: Booked slot for Tutor 2
  const slot3Date = new Date(now);
  slot3Date.setDate(slot3Date.getDate() + 1);
  slot3Date.setHours(16, 0, 0, 0);
  const slot3End = new Date(slot3Date);
  slot3End.setHours(17, 0, 0, 0);

  const slot3 = await prisma.availabilitySlot.create({
    data: {
      tutorId: tutor2.id,
      startTime: slot3Date,
      endTime: slot3End,
      isBooked: true, // Booked by Student 2
    },
  });

  // 8. Create Bookings
  await prisma.booking.create({
    data: {
      studentId: student1.id,
      tutorId: tutor1.id,
      subjectId: mernSubject.id,
      availabilitySlotId: slot1.id,
      startTime: slot1Date,
      endTime: slot1End,
      status: BookingStatus.CONFIRMED,
      totalPrice: 45.0,
      notes: "Need help building Prisma relations and authentication middleware.",
    },
  });

  await prisma.booking.create({
    data: {
      studentId: student2.id,
      tutorId: tutor2.id,
      subjectId: calcSubject.id,
      availabilitySlotId: slot3.id,
      startTime: slot3Date,
      endTime: slot3End,
      status: BookingStatus.PENDING,
      totalPrice: 50.0,
      notes: "Reviewing integration techniques before upcoming midterm.",
    },
  });

  console.log("✅ Seed completed successfully! Created Users, Profiles, Subjects, Slots, and Bookings.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });