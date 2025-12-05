/*
  Warnings:

  - Added the required column `prenom` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "prenom" TEXT NOT NULL;
