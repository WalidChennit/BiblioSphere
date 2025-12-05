/*
  Warnings:

  - You are about to drop the column `name` on the `Author` table. All the data in the column will be lost.
  - Added the required column `nom` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" DROP COLUMN "name",
ADD COLUMN     "nom" TEXT NOT NULL;
