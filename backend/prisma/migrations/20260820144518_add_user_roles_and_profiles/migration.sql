-- CreateEnum
CREATE TYPE "TutorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isStudent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isTutor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "TutorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "education" TEXT,
    "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
    "verificationStatus" "TutorStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "certificates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoIntroUrl" TEXT,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "educationLevel" TEXT,
    "major" TEXT,
    "learningGoals" TEXT,
    "preferredSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningStyle" TEXT,
    "timezone" TEXT,
    "preferredLanguage" TEXT,
    "maxHourlyRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "TutorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
