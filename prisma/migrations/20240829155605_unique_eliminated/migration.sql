/*
  Warnings:

  - You are about to drop the column `title` on the `Book` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Author_name_key";

-- DropIndex
DROP INDEX "Book_bookId_key";

-- DropIndex
DROP INDEX "Book_isbn_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "title";
