-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'LEGAL', 'REAL_ESTATE', 'CONSULTING', 'MARKETING', 'SALES', 'ENGINEERING', 'EXECUTIVE', 'ENTREPRENEURSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "TeeTimeStatus" AS ENUM ('OPEN', 'FULL', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TEE_TIME_JOINED', 'TEE_TIME_LEFT', 'TEE_TIME_CANCELLED', 'TEE_TIME_REMINDER', 'NEW_MESSAGE', 'SLOT_AVAILABLE', 'MATCH_FOUND');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('PUBLIC', 'PRIVATE', 'SEMI_PRIVATE', 'RESORT', 'MUNICIPAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "industry" "Industry",
    "company" TEXT,
    "jobTitle" TEXT,
    "bio" TEXT,
    "handicap" DOUBLE PRECISION,
    "skillLevel" "SkillLevel",
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "city" TEXT,
    "state" TEXT,
    "searchRadius" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "courseType" "CourseType" NOT NULL,
    "holes" INTEGER NOT NULL DEFAULT 18,
    "par" INTEGER,
    "rating" DOUBLE PRECISION,
    "slope" INTEGER,
    "yardage" INTEGER,
    "greenFee" INTEGER,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeeTime" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "totalSlots" INTEGER NOT NULL DEFAULT 4,
    "industryPreference" "Industry"[],
    "skillPreference" "SkillLevel"[],
    "notes" TEXT,
    "status" "TeeTimeStatus" NOT NULL DEFAULT 'OPEN',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeeTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeeTimeSlot" (
    "id" TEXT NOT NULL,
    "teeTimeId" TEXT NOT NULL,
    "userId" TEXT,
    "slotNumber" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "TeeTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "teeTimeId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteCourse" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteCourse_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_industry_idx" ON "User"("industry");

-- CreateIndex
CREATE INDEX "User_skillLevel_idx" ON "User"("skillLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_city_state_idx" ON "Course"("city", "state");

-- CreateIndex
CREATE INDEX "Course_courseType_idx" ON "Course"("courseType");

-- CreateIndex
CREATE INDEX "TeeTime_hostId_idx" ON "TeeTime"("hostId");

-- CreateIndex
CREATE INDEX "TeeTime_courseId_idx" ON "TeeTime"("courseId");

-- CreateIndex
CREATE INDEX "TeeTime_dateTime_idx" ON "TeeTime"("dateTime");

-- CreateIndex
CREATE INDEX "TeeTime_status_idx" ON "TeeTime"("status");

-- CreateIndex
CREATE INDEX "TeeTimeSlot_userId_idx" ON "TeeTimeSlot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeeTimeSlot_teeTimeId_slotNumber_key" ON "TeeTimeSlot"("teeTimeId", "slotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TeeTimeSlot_teeTimeId_userId_key" ON "TeeTimeSlot"("teeTimeId", "userId");

-- CreateIndex
CREATE INDEX "Message_teeTimeId_createdAt_idx" ON "Message"("teeTimeId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "TeeTime" ADD CONSTRAINT "TeeTime_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTime" ADD CONSTRAINT "TeeTime_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTimeSlot" ADD CONSTRAINT "TeeTimeSlot_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "TeeTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTimeSlot" ADD CONSTRAINT "TeeTimeSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "TeeTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteCourse" ADD CONSTRAINT "FavoriteCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteCourse" ADD CONSTRAINT "FavoriteCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
