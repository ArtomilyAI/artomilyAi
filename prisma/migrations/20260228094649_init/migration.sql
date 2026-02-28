-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('RAMADHAN', 'CHINESE_NEW_YEAR', 'NATIONAL_DAY', 'TRENDING_MEME', 'VIRAL_TEMPLATE', 'BUSINESS', 'SOCIAL_MEDIA', 'MARKETING');

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "type" "GenerationType" NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "tags" TEXT[],
    "thumbnail" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "templates_category_idx" ON "templates"("category");

-- CreateIndex
CREATE INDEX "templates_type_idx" ON "templates"("type");

-- CreateIndex
CREATE INDEX "templates_isPublic_idx" ON "templates"("isPublic");
