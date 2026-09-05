import { prisma } from "./db";

async function requireUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`Seed user not found: ${email}. Run seedData.ts first.`);
  }
  return user;
}

async function seedConversation(
  participantIds: string[],
  messages: Array<{
    senderId: string;
    text: string;
    createdAt: Date;
  }>,
) {
  const candidates = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: participantIds[0] } },
      AND: { participants: { some: { userId: participantIds[1] } } },
    },
    include: { participants: true },
  });
  const existing = candidates.find(({ participants }) =>
    participants.length === participantIds.length &&
    participantIds.every((userId) => participants.some((participant) => participant.userId === userId)),
  );
  const conversation = existing ?? await prisma.conversation.create({
    data: { participants: { create: participantIds.map((userId) => ({ userId })) } },
  });
  const conversationId = conversation.id;

  for (const message of messages) {
    const duplicate = await prisma.message.findFirst({
      where: { conversationId, senderId: message.senderId, text: message.text },
    });
    if (!duplicate) {
      await prisma.message.create({ data: { ...message, conversationId } });
    }
  }
}

async function main() {
  console.log("Seeding chat conversations and messages...");

  const maya = await requireUser("maya.student@example.com");
  const alex = await requireUser("alex.tutor@example.com");
  const liam = await requireUser("liam.student@example.com");
  const sarah = await requireUser("sarah.math@example.com");

  await seedConversation(
    [maya.id, alex.id],
    [
      {
        senderId: maya.id,
        text: "Hi Alex, could we review the Prisma relations before my next session?",
        createdAt: new Date("2026-09-03T09:15:00.000Z"),
      },
      {
        senderId: alex.id,
        text: "Absolutely. Bring your schema and we will walk through the relations together.",
        createdAt: new Date("2026-09-03T09:22:00.000Z"),
      },
      {
        senderId: maya.id,
        text: "Perfect, I will have it ready for Thursday.",
        createdAt: new Date("2026-09-03T09:26:00.000Z"),
      },
    ],
  );

  await seedConversation(
    [liam.id, sarah.id],
    [
      {
        senderId: liam.id,
        text: "Hi Sarah, I am stuck on the integration techniques from this week.",
        createdAt: new Date("2026-09-04T14:05:00.000Z"),
      },
      {
        senderId: sarah.id,
        text: "Send me the question you are working on and we can break it down step by step.",
        createdAt: new Date("2026-09-04T14:12:00.000Z"),
      },
    ],
  );

  await seedConversation(
    [maya.id, sarah.id],
    [
      {
        senderId: maya.id,
        text: "Could you recommend some practice problems for integration by parts?",
        createdAt: new Date("2026-09-02T11:10:00.000Z"),
      },
      {
        senderId: sarah.id,
        text: "Start with the three examples I shared in the course notes. They cover the common patterns.",
        createdAt: new Date("2026-09-02T11:18:00.000Z"),
      },
    ],
  );

  await seedConversation(
    [maya.id, liam.id],
    [
      {
        senderId: liam.id,
        text: "Are you joining the study group for the data structures review?",
        createdAt: new Date("2026-09-01T16:30:00.000Z"),
      },
      {
        senderId: maya.id,
        text: "Yes, I will bring the tree traversal exercises.",
        createdAt: new Date("2026-09-01T16:36:00.000Z"),
      },
    ],
  );

  await seedConversation(
    [liam.id, alex.id],
    [
      {
        senderId: liam.id,
        text: "I would like help debugging my React project before the submission.",
        createdAt: new Date("2026-09-04T08:40:00.000Z"),
      },
      {
        senderId: alex.id,
        text: "Sure. Please send the error and the component where it occurs.",
        createdAt: new Date("2026-09-04T08:48:00.000Z"),
      },
    ],
  );

  await seedConversation(
    [alex.id, sarah.id],
    [
      {
        senderId: alex.id,
        text: "Are you available to compare notes on the upcoming tutoring workshop?",
        createdAt: new Date("2026-08-31T13:20:00.000Z"),
      },
      {
        senderId: sarah.id,
        text: "Yes, I can meet tomorrow afternoon and bring the draft agenda.",
        createdAt: new Date("2026-08-31T13:28:00.000Z"),
      },
    ],
  );

  console.log("Chat seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Chat seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
