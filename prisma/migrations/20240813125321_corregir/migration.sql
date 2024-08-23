/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "createdAt",
DROP COLUMN "image",
DROP COLUMN "updatedAt",
DROP COLUMN "year",
ADD COLUMN     "awards" TEXT,
ADD COLUMN     "bbeScore" DOUBLE PRECISION,
ADD COLUMN     "bbeVotes" INTEGER,
ADD COLUMN     "bookFormat" TEXT,
ADD COLUMN     "bookId" TEXT NOT NULL,
ADD COLUMN     "characters" TEXT,
ADD COLUMN     "coverImg" TEXT,
ADD COLUMN     "edition" TEXT,
ADD COLUMN     "firstPublishDate" TIMESTAMP(3),
ADD COLUMN     "genres" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "likedPercent" DOUBLE PRECISION,
ADD COLUMN     "numRatings" INTEGER,
ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "publishDate" TIMESTAMP(3),
ADD COLUMN     "ratingsByStars" TEXT,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "setting" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Book_bookId_key" ON "Book"("bookId");
