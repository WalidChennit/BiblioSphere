/*
  Warnings:

  - You are about to drop the column `auteur` on the `Livre` table. All the data in the column will be lost.
  - You are about to drop the column `categories` on the `Livre` table. All the data in the column will be lost.
  - You are about to drop the column `editeur` on the `Livre` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Livre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `editorId` to the `Livre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Livre" DROP COLUMN "auteur",
DROP COLUMN "categories",
DROP COLUMN "editeur",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "editorId" INTEGER NOT NULL,
ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Editor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Editor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivreAuteur" (
    "livreId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "LivreAuteur_pkey" PRIMARY KEY ("livreId","authorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Editor_name_key" ON "Editor"("name");

-- AddForeignKey
ALTER TABLE "LivreAuteur" ADD CONSTRAINT "LivreAuteur_livreId_fkey" FOREIGN KEY ("livreId") REFERENCES "Livre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivreAuteur" ADD CONSTRAINT "LivreAuteur_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livre" ADD CONSTRAINT "Livre_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livre" ADD CONSTRAINT "Livre_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Editor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
