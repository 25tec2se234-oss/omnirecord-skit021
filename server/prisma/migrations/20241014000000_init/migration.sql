-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLATFORM_SUPER_ADMIN', 'INSTITUTION_ADMIN', 'FACULTY_COORDINATOR', 'STUDENT', 'AUDITOR_VIEWER');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'GRADUATED', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'NEEDS_CORRECTION', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('COMMUNITY_FREE', 'CAMPUS_PRO', 'ENTERPRISE_INSTITUTION');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "accreditation" TEXT,
    "address" TEXT,
    "academicYear" TEXT DEFAULT '2024 - 2025',
    "status" "InstitutionStatus" NOT NULL DEFAULT 'ACTIVE',
    "adminEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionMembership" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "departmentId" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coordinatorName" TEXT,
    "coordinatorEmail" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "userId" TEXT,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "phone" TEXT,
    "cgpa" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'In-Person',
    "coordinator" TEXT NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'Upcoming',
    "maxParticipants" INTEGER NOT NULL DEFAULT 100,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipationRecord" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "recordNumber" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "participationDate" TIMESTAMP(3) NOT NULL,
    "achievementLevel" TEXT NOT NULL,
    "certificateRef" TEXT,
    "description" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceFile" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storedFilename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileDisplaySize" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "sha256Checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationReview" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerDepartment" TEXT,
    "previousStatus" "VerificationStatus" NOT NULL,
    "newStatus" "VerificationStatus" NOT NULL,
    "decisionNotes" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "actorUserId" TEXT,
    "actorEmail" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "recipientRole" "Role",
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "targetPage" TEXT,
    "recordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FACULTY_COORDINATOR',
    "departmentId" TEXT,
    "token" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'CAMPUS_PRO',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "maxStudents" INTEGER NOT NULL DEFAULT 2000,
    "maxActivities" INTEGER NOT NULL DEFAULT 500,
    "providerSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionEvent" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_code_key" ON "Institution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_portalId_key" ON "Institution"("portalId");

-- CreateIndex
CREATE INDEX "Institution_status_idx" ON "Institution"("status");

-- CreateIndex
CREATE INDEX "Institution_code_idx" ON "Institution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "InstitutionMembership_institutionId_role_idx" ON "InstitutionMembership"("institutionId", "role");

-- CreateIndex
CREATE INDEX "InstitutionMembership_userId_idx" ON "InstitutionMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionMembership_institutionId_userId_key" ON "InstitutionMembership"("institutionId", "userId");

-- CreateIndex
CREATE INDEX "Department_institutionId_idx" ON "Department"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_institutionId_code_key" ON "Department"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_institutionId_departmentId_idx" ON "StudentProfile"("institutionId", "departmentId");

-- CreateIndex
CREATE INDEX "StudentProfile_institutionId_status_idx" ON "StudentProfile"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_institutionId_studentId_key" ON "StudentProfile"("institutionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_institutionId_email_key" ON "StudentProfile"("institutionId", "email");

-- CreateIndex
CREATE INDEX "Activity_institutionId_category_idx" ON "Activity"("institutionId", "category");

-- CreateIndex
CREATE INDEX "Activity_institutionId_status_idx" ON "Activity"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Activity_institutionId_departmentId_idx" ON "Activity"("institutionId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_institutionId_code_key" ON "Activity"("institutionId", "code");

-- CreateIndex
CREATE INDEX "ParticipationRecord_institutionId_verificationStatus_idx" ON "ParticipationRecord"("institutionId", "verificationStatus");

-- CreateIndex
CREATE INDEX "ParticipationRecord_institutionId_studentProfileId_idx" ON "ParticipationRecord"("institutionId", "studentProfileId");

-- CreateIndex
CREATE INDEX "ParticipationRecord_institutionId_activityId_idx" ON "ParticipationRecord"("institutionId", "activityId");

-- CreateIndex
CREATE INDEX "ParticipationRecord_institutionId_departmentId_idx" ON "ParticipationRecord"("institutionId", "departmentId");

-- CreateIndex
CREATE INDEX "ParticipationRecord_institutionId_category_idx" ON "ParticipationRecord"("institutionId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipationRecord_institutionId_recordNumber_key" ON "ParticipationRecord"("institutionId", "recordNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceFile_storedFilename_key" ON "EvidenceFile"("storedFilename");

-- CreateIndex
CREATE INDEX "EvidenceFile_institutionId_recordId_idx" ON "EvidenceFile"("institutionId", "recordId");

-- CreateIndex
CREATE INDEX "VerificationReview_institutionId_recordId_idx" ON "VerificationReview"("institutionId", "recordId");

-- CreateIndex
CREATE INDEX "VerificationReview_institutionId_reviewerUserId_idx" ON "VerificationReview"("institutionId", "reviewerUserId");

-- CreateIndex
CREATE INDEX "AuditLog_institutionId_timestamp_idx" ON "AuditLog"("institutionId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_actorEmail_idx" ON "AuditLog"("actorEmail");

-- CreateIndex
CREATE INDEX "Notification_institutionId_recipientUserId_read_idx" ON "Notification"("institutionId", "recipientUserId", "read");

-- CreateIndex
CREATE INDEX "Notification_institutionId_createdAt_idx" ON "Notification"("institutionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_institutionId_status_idx" ON "Invitation"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Invitation_token_idx" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_institutionId_key" ON "Subscription"("institutionId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionEvent_eventId_key" ON "SubscriptionEvent"("eventId");

-- CreateIndex
CREATE INDEX "SubscriptionEvent_subscriptionId_idx" ON "SubscriptionEvent"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionEvent_eventId_idx" ON "SubscriptionEvent"("eventId");

-- AddForeignKey
ALTER TABLE "InstitutionMembership" ADD CONSTRAINT "InstitutionMembership_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionMembership" ADD CONSTRAINT "InstitutionMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionMembership" ADD CONSTRAINT "InstitutionMembership_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationRecord" ADD CONSTRAINT "ParticipationRecord_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationRecord" ADD CONSTRAINT "ParticipationRecord_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationRecord" ADD CONSTRAINT "ParticipationRecord_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationRecord" ADD CONSTRAINT "ParticipationRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "ParticipationRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationReview" ADD CONSTRAINT "VerificationReview_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationReview" ADD CONSTRAINT "VerificationReview_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "ParticipationRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationReview" ADD CONSTRAINT "VerificationReview_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

