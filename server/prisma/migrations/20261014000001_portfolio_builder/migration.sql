-- CreateEnum
CREATE TYPE "PortfolioTemplate" AS ENUM ('CLEAN_MINIMAL', 'TECH_DEV_CARD', 'ACADEMIC_PROFESSIONAL');

-- CreateEnum
CREATE TYPE "PortfolioVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "StudentPortfolio" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "template" "PortfolioTemplate" NOT NULL DEFAULT 'CLEAN_MINIMAL',
    "visibility" "PortfolioVisibility" NOT NULL DEFAULT 'PRIVATE',
    "headline" TEXT,
    "bio" TEXT,
    "customSlug" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioCredential" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPortfolio_studentProfileId_key" ON "StudentPortfolio"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPortfolio_customSlug_key" ON "StudentPortfolio"("customSlug");

-- CreateIndex
CREATE INDEX "StudentPortfolio_institutionId_idx" ON "StudentPortfolio"("institutionId");

-- CreateIndex
CREATE INDEX "StudentPortfolio_studentProfileId_idx" ON "StudentPortfolio"("studentProfileId");

-- CreateIndex
CREATE INDEX "StudentPortfolio_visibility_idx" ON "StudentPortfolio"("visibility");

-- CreateIndex
CREATE INDEX "StudentPortfolio_customSlug_idx" ON "StudentPortfolio"("customSlug");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioCredential_portfolioId_recordId_key" ON "PortfolioCredential"("portfolioId", "recordId");

-- CreateIndex
CREATE INDEX "PortfolioCredential_portfolioId_idx" ON "PortfolioCredential"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioCredential_recordId_idx" ON "PortfolioCredential"("recordId");

-- CreateIndex
CREATE INDEX "PortfolioCredential_displayOrder_idx" ON "PortfolioCredential"("displayOrder");

-- AddForeignKey
ALTER TABLE "StudentPortfolio" ADD CONSTRAINT "StudentPortfolio_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPortfolio" ADD CONSTRAINT "StudentPortfolio_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioCredential" ADD CONSTRAINT "PortfolioCredential_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "StudentPortfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioCredential" ADD CONSTRAINT "PortfolioCredential_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "ParticipationRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
