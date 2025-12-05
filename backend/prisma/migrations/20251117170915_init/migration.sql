-- CreateEnum
CREATE TYPE "Role" AS ENUM ('etudiant', 'membre_public', 'personnel');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nin" TEXT NOT NULL,
    "matricule" TEXT,
    "dateDeNaissance" TIMESTAMP(3) NOT NULL,
    "telephone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livre" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "editeur" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "anneePublication" INTEGER,
    "langue" TEXT,
    "categories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Livre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exemplaire" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "etat" TEXT NOT NULL,
    "livreId" INTEGER NOT NULL,

    CONSTRAINT "Exemplaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emprunt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exemplaireId" INTEGER NOT NULL,
    "dateEmprunt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateRetour" TIMESTAMP(3),
    "renouvellement" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Emprunt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exemplaireId" INTEGER NOT NULL,
    "dateReservation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nin_key" ON "User"("nin");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricule_key" ON "User"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Livre_isbn_key" ON "Livre"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Exemplaire_code_key" ON "Exemplaire"("code");

-- AddForeignKey
ALTER TABLE "Exemplaire" ADD CONSTRAINT "Exemplaire_livreId_fkey" FOREIGN KEY ("livreId") REFERENCES "Livre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_exemplaireId_fkey" FOREIGN KEY ("exemplaireId") REFERENCES "Exemplaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_exemplaireId_fkey" FOREIGN KEY ("exemplaireId") REFERENCES "Exemplaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
