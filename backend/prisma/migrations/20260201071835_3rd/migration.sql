/*
  Warnings:

  - You are about to drop the column `url` on the `Media` table. All the data in the column will be lost.
  - Added the required column `source` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('YOUTUBE', 'R2');

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "url",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "objectKey" TEXT,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "source" "MediaSource" NOT NULL,
ADD COLUMN     "youtubeId" TEXT;
