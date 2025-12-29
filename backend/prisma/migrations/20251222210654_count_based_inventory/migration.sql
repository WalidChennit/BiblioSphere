/*
  Warnings:

  - You are about to drop the column `exemplaireId` on the `Emprunt` table. All the data in the column will be lost.
  - You are about to drop the column `exemplaireId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the `Exemplaire` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `livreId` to the `Emprunt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `livreId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Emprunt" DROP CONSTRAINT "Emprunt_exemplaireId_fkey";

-- DropForeignKey
ALTER TABLE "Exemplaire" DROP CONSTRAINT "Exemplaire_livreId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_exemplaireId_fkey";

-- AlterTable
ALTER TABLE "Emprunt" DROP COLUMN "exemplaireId",
ADD COLUMN     "livreId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Livre" ADD COLUMN     "borrowedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reservedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockDisponible" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockTotal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "exemplaireId",
ADD COLUMN     "livreId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Exemplaire";

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_livreId_fkey" FOREIGN KEY ("livreId") REFERENCES "Livre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_livreId_fkey" FOREIGN KEY ("livreId") REFERENCES "Livre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
