import { PrismaClient, TutorStatus, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Clearing database...");
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.tutorSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("📚 Seeding CS Subjects...");
  const dsa = await prisma.subject.create({
    data: {
      name: "Data Structures & Algorithms",
      category: "Computer Science",
      description: "Arrays, Trees, Graphs, Sorting, Dynamic Programming, and Complexity Analysis.",
    },
  });

  const webdev = await prisma.subject.create({
    data: {
      name: "Full-Stack Web Development",
      category: "Software Engineering",
      description: "Modern MERN stack development, REST APIs, and database integration.",
    },
  });

  const dbms = await prisma.subject.create({
    data: {
      name: "Database Systems & SQL",
      category: "Computer Science",
      description: "Relational database design, normalization, indexing, and SQL queries.",
    },
  });

  const os = await prisma.subject.create({
    data: {
      name: "Operating Systems",
      category: "Systems",
      description: "Processes, Threads, Mutex locks, CPU Scheduling, and Memory Management.",
    },
  });

  console.log("👤 Seeding CS Users & Profiles...");

  // 1. Primary Tutor: Sarah Chen
  const tutorSarah = await prisma.user.create({
    data: {
      email: "sarah.chen@univ.edu",
      password: "hashed_password_here",
      firstName: "Sarah",
      lastName: "Chen",
      isStudent: false,
      isTutor: true,
      isAdmin: false,
      tutorProfile: {
        create: {
          headline: "Senior CS TA & Full-Stack Developer",
          bio: "Specializing in Data Structures, Algorithms, and React/Node.js stack.",
          hourlyRate: 35.0,
          education: "B.S. in Computer Science (Senior)",
          verificationStatus: TutorStatus.APPROVED,
          certificates: ["AWS Certified Developer", "TA Excellence Award"],
          experience: ["2+ Years CS Peer Tutor", "Full-Stack Software Engineering Intern"],
          averageRating: 4.9,
          reviewCount: 24,
          isFeatured: true,
        },
      },
    },
  });

  // 2. Secondary Tutor: Alex Rivera
  const tutorAlex = await prisma.user.create({
    data: {
      email: "alex.rivera@univ.edu",
      password: "hashed_password_here",
      firstName: "Alex",
      lastName: "Rivera",
      isStudent: false,
      isTutor: true,
      isAdmin: false,
      tutorProfile: {
        create: {
          headline: "Systems & Database Specialist",
          bio: "Passionate about low-level systems programming, C/C++, and SQL database optimization.",
          hourlyRate: 30.0,
          education: "M.S. in Computer Science (M1)",
          verificationStatus: TutorStatus.APPROVED,
          certificates: ["Oracle Certified Database Professional"],
          experience: ["Systems Programming TA"],
          averageRating: 4.8,
          reviewCount: 15,
        },
      },
    },
  });

  // 3. Student: Liam Smith
  const studentLiam = await prisma.user.create({
    data: {
      email: "liam.smith@univ.edu",
      password: "hashed_password_here",
      firstName: "Liam",
      lastName: "Smith",
      isStudent: true,
      isTutor: false,
      isAdmin: false,
      studentProfile: {
        create: {
          educationLevel: "Undergraduate (Junior)",
          major: "Computer Science",
          learningGoals: "Master LeetCode Mediums and prepare for SWE technical interviews.",
          preferredSubjects: ["Data Structures & Algorithms", "Full-Stack Web Development"],
          timezone: "UTC+3",
        },
      },
    },
  });

  // 4. Student: Mariam Saleh
  const studentMariam = await prisma.user.create({
    data: {
      email: "mariam.saleh@univ.edu",
      firstName: "Mariam",
      lastName: "Saleh",
      password: "hashed_password_here",
      isStudent: true,
      isTutor: false,
      isAdmin: false,
      studentProfile: {
        create: {
          educationLevel: "Undergraduate (Sophomore)",
          major: "Computer Science",
          learningGoals: "Ace Operating Systems and Database midterms.",
          preferredSubjects: ["Database Systems & SQL", "Operating Systems"],
        },
      },
    },
  });

  console.log("🔗 Mapping Tutor Subjects...");
  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: tutorSarah.id, subjectId: dsa.id },
      { tutorId: tutorSarah.id, subjectId: webdev.id },
      { tutorId: tutorAlex.id, subjectId: dbms.id },
      { tutorId: tutorAlex.id, subjectId: os.id },
    ],
  });

  console.log("📅 Seeding Availability Slots & Bookings...");
  const getRelativeDate = (dayOffset: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  // Open availability slot for Sarah Chen (Tomorrow at 10 AM)
  await prisma.availabilitySlot.create({
    data: {
      tutorId: tutorSarah.id,
      startTime: getRelativeDate(1, 10),
      endTime: getRelativeDate(1, 11),
      isBooked: false,
    },
  });

  // Open availability slot for Sarah Chen (Tomorrow at 2 PM)
  await prisma.availabilitySlot.create({
    data: {
      tutorId: tutorSarah.id,
      startTime: getRelativeDate(1, 14),
      endTime: getRelativeDate(1, 15),
      isBooked: false,
    },
  });

  // Booked Slot for Alex Rivera (In 2 Days at 11 AM)
  const bookedSlot1 = await prisma.availabilitySlot.create({
    data: {
      tutorId: tutorAlex.id,
      startTime: getRelativeDate(2, 11),
      endTime: getRelativeDate(2, 12),
      isBooked: true,
    },
  });

  await prisma.booking.create({
    data: {
      studentId: studentLiam.id,
      tutorId: tutorAlex.id,
      subjectId: os.id,
      availabilitySlotId: bookedSlot1.id,
      startTime: bookedSlot1.startTime,
      endTime: bookedSlot1.endTime,
      status: BookingStatus.CONFIRMED,
      totalPrice: 30.0,
      notes: "Need help understanding process synchronization and mutex locks for Assignment 2.",
    },
  });

  // Booked Slot for Sarah Chen (In 3 Days at 4 PM)
  const bookedSlot2 = await prisma.availabilitySlot.create({
    data: {
      tutorId: tutorSarah.id,
      startTime: getRelativeDate(3, 16),
      endTime: getRelativeDate(3, 17),
      isBooked: true,
    },
  });

  await prisma.booking.create({
    data: {
      studentId: studentMariam.id,
      tutorId: tutorSarah.id,
      subjectId: dsa.id,
      availabilitySlotId: bookedSlot2.id,
      startTime: bookedSlot2.startTime,
      endTime: bookedSlot2.endTime,
      status: BookingStatus.CONFIRMED,
      totalPrice: 35.0,
      notes: "Reviewing Graph Traversal (DFS/BFS) for the upcoming midterm.",
    },
  });

  console.log("💬 Seeding Chat Conversations & Messages...");
  const conv = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: studentLiam.id },
          { userId: tutorSarah.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv.id,
        senderId: tutorSarah.id,
        text: "Hi Liam, process synchronization can be tricky! Let me know which topics you want to cover.",
      },
      {
        conversationId: conv.id,
        senderId: studentLiam.id,
        text: "Hey Sarah! Can we start with binary trees and dynamic programming?",
      },
      {
        conversationId: conv.id,
        senderId: tutorSarah.id,
        text: "Can you tell me what time is suitable for you?",
      },
    ],
  });

  console.log("✅ CS Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });