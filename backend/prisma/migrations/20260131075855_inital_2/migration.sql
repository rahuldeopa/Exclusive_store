-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "ContentSet" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "accessCodeId" INTEGER NOT NULL,

    CONSTRAINT "ContentSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "type" "MediaType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "contentSetId" INTEGER NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentSet_accessCodeId_key" ON "ContentSet"("accessCodeId");

-- AddForeignKey
ALTER TABLE "ContentSet" ADD CONSTRAINT "ContentSet_accessCodeId_fkey" FOREIGN KEY ("accessCodeId") REFERENCES "AccessCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_contentSetId_fkey" FOREIGN KEY ("contentSetId") REFERENCES "ContentSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
