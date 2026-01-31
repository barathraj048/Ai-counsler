-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "ranking" INTEGER,
    "programName" TEXT,
    "tuitionFee" TEXT,
    "status" TEXT NOT NULL DEFAULT 'discovered',
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shortlistedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "universityData" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "University_userId_idx" ON "University"("userId");

-- CreateIndex
CREATE INDEX "University_userId_status_idx" ON "University"("userId", "status");

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
