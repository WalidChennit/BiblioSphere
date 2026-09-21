import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Test1234!';

function randomDateWithinLastMonths(months: number): Date {
  const now = Date.now();
  const past = now - months * 30 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function upsertUser(data: {
  email: string;
  prenom: string;
  nom: string;
  nin: string;
  telephone: string;
  role: Role;
  createdAt?: Date;
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      prenom: data.prenom,
      nom: data.nom,
      nin: data.nin,
      telephone: data.telephone,
      dateDeNaissance: new Date(1998 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 27)),
      passwordHash,
      role: data.role,
      status: 'ACTIVE',
      createdAt: data.createdAt ?? randomDateWithinLastMonths(10),
    },
  });
}

async function main() {
  console.log('Seeding categories, editors, authors...');

  const categoryNames = ['Informatique', 'Roman', 'Histoire', 'Science', 'Philosophie', 'Art'];
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name } })),
  );

  const editorNames = ['O\'Reilly Media', 'Dunod', 'Gallimard', 'Eyrolles', 'Flammarion'];
  const editors = await Promise.all(
    editorNames.map((name) => prisma.editor.upsert({ where: { name }, update: {}, create: { name } })),
  );

  const authorDefs = [
    { nom: 'Martin', prenom: 'Robert C.' },
    { nom: 'Hugo', prenom: 'Victor' },
    { nom: 'Camus', prenom: 'Albert' },
    { nom: 'Fowler', prenom: 'Martin' },
    { nom: 'Duflo', prenom: 'Esther' },
    { nom: 'Diamond', prenom: 'Jared' },
    { nom: 'Verne', prenom: 'Jules' },
    { nom: 'de Saint-Exupéry', prenom: 'Antoine' },
    { nom: 'Hawking', prenom: 'Stephen' },
    { nom: 'Sartre', prenom: 'Jean-Paul' },
    { nom: 'Knuth', prenom: 'Donald' },
    { nom: 'Zola', prenom: 'Émile' },
  ];

  const authors: { id: number }[] = [];
  for (const a of authorDefs) {
    let existing = await prisma.author.findFirst({ where: { nom: a.nom, prenom: a.prenom } });
    if (!existing) existing = await prisma.author.create({ data: a });
    authors.push(existing);
  }

  console.log('Seeding books...');

  const bookDefs = [
    { titre: 'Clean Code', cat: 'Informatique', ed: "O'Reilly Media", auteurIdx: [0], annee: 2008, langue: 'Anglais' },
    { titre: 'Refactoring', cat: 'Informatique', ed: "O'Reilly Media", auteurIdx: [3], annee: 2018, langue: 'Anglais' },
    { titre: 'The Art of Computer Programming', cat: 'Informatique', ed: 'Dunod', auteurIdx: [10], annee: 1968, langue: 'Anglais' },
    { titre: 'Design Patterns Expliqués', cat: 'Informatique', ed: 'Eyrolles', auteurIdx: [0, 3], annee: 2010, langue: 'Français' },
    { titre: 'Algorithmes en Python', cat: 'Informatique', ed: 'Dunod', auteurIdx: [10], annee: 2015, langue: 'Français' },
    { titre: 'Les Misérables', cat: 'Roman', ed: 'Gallimard', auteurIdx: [1], annee: 1862, langue: 'Français' },
    { titre: "L'Étranger", cat: 'Roman', ed: 'Gallimard', auteurIdx: [2], annee: 1942, langue: 'Français' },
    { titre: 'Le Petit Prince', cat: 'Roman', ed: 'Gallimard', auteurIdx: [7], annee: 1943, langue: 'Français' },
    { titre: 'Germinal', cat: 'Roman', ed: 'Flammarion', auteurIdx: [11], annee: 1885, langue: 'Français' },
    { titre: 'Vingt Mille Lieues sous les mers', cat: 'Roman', ed: 'Flammarion', auteurIdx: [6], annee: 1870, langue: 'Français' },
    { titre: 'Notre-Dame de Paris', cat: 'Roman', ed: 'Gallimard', auteurIdx: [1], annee: 1831, langue: 'Français' },
    { titre: 'Sapiens', cat: 'Histoire', ed: 'Flammarion', auteurIdx: [5], annee: 2011, langue: 'Français' },
    { titre: 'Effondrement', cat: 'Histoire', ed: 'Gallimard', auteurIdx: [5], annee: 2005, langue: 'Français' },
    { titre: 'Une Brève Histoire du Temps', cat: 'Science', ed: 'Flammarion', auteurIdx: [8], annee: 1988, langue: 'Français' },
    { titre: 'Trous Noirs et Bébés Univers', cat: 'Science', ed: 'Flammarion', auteurIdx: [8], annee: 1993, langue: 'Français' },
    { titre: "L'Économie des Pauvres", cat: 'Science', ed: 'Dunod', auteurIdx: [4], annee: 2011, langue: 'Français' },
    { titre: "L'Être et le Néant", cat: 'Philosophie', ed: 'Gallimard', auteurIdx: [9], annee: 1943, langue: 'Français' },
    { titre: 'La Nausée', cat: 'Philosophie', ed: 'Gallimard', auteurIdx: [9], annee: 1938, langue: 'Français' },
    { titre: 'Le Mythe de Sisyphe', cat: 'Philosophie', ed: 'Gallimard', auteurIdx: [2], annee: 1942, langue: 'Français' },
    { titre: "Histoire de l'Art Occidental", cat: 'Art', ed: 'Eyrolles', auteurIdx: [1], annee: 2000, langue: 'Français' },
    { titre: 'Le Guide du Dessin', cat: 'Art', ed: 'Eyrolles', auteurIdx: [3], annee: 2016, langue: 'Français' },
    { titre: 'Architecture Logicielle', cat: 'Informatique', ed: "O'Reilly Media", auteurIdx: [3], annee: 2020, langue: 'Français' },
    { titre: 'Bases de Données Modernes', cat: 'Informatique', ed: 'Dunod', auteurIdx: [10], annee: 2019, langue: 'Français' },
    { titre: 'Intelligence Artificielle: Une Approche Moderne', cat: 'Informatique', ed: "O'Reilly Media", auteurIdx: [10], annee: 2021, langue: 'Anglais' },
  ];

  const categoryByName = new Map(categories.map((c) => [c.name, c]));
  const editorByName = new Map(editors.map((e) => [e.name, e]));

  const books: { id: number; stockTotal: number; stockDisponible: number }[] = [];

  for (let i = 0; i < bookDefs.length; i++) {
    const b = bookDefs[i];
    const isbn = `978-2-${String(1000 + i).padStart(6, '0')}-${i}`;
    const stockTotal = 3 + Math.floor(Math.random() * 6);
    const createdAt = randomDateWithinLastMonths(10);

    const livre = await prisma.livre.upsert({
      where: { isbn },
      update: {},
      create: {
        titre: b.titre,
        description: `${b.titre} — un ouvrage incontournable de la catégorie ${b.cat}.`,
        isbn,
        anneePublication: b.annee,
        langue: b.langue,
        categoryId: categoryByName.get(b.cat)!.id,
        editorId: editorByName.get(b.ed)!.id,
        stockTotal,
        stockDisponible: stockTotal,
        createdAt,
      },
    });

    const existingLinks = await prisma.livreAuteur.findMany({ where: { livreId: livre.id } });
    if (existingLinks.length === 0) {
      for (const idx of b.auteurIdx) {
        await prisma.livreAuteur.create({ data: { livreId: livre.id, authorId: authors[idx].id } });
      }
    }

    books.push({ id: livre.id, stockTotal, stockDisponible: livre.stockDisponible });
  }

  console.log('Seeding demo student & personnel accounts...');

  const studentDefs = [
    { email: 'amina.benali@bibliosphere.test', prenom: 'Amina', nom: 'Benali' },
    { email: 'yacine.saidi@bibliosphere.test', prenom: 'Yacine', nom: 'Saidi' },
    { email: 'lina.kaddour@bibliosphere.test', prenom: 'Lina', nom: 'Kaddour' },
    { email: 'karim.boudiaf@bibliosphere.test', prenom: 'Karim', nom: 'Boudiaf' },
    { email: 'sofia.meziane@bibliosphere.test', prenom: 'Sofia', nom: 'Meziane' },
    { email: 'omar.haddad@bibliosphere.test', prenom: 'Omar', nom: 'Haddad' },
    { email: 'nour.cherif@bibliosphere.test', prenom: 'Nour', nom: 'Cherif' },
    { email: 'walid.brahimi@bibliosphere.test', prenom: 'Walid', nom: 'Brahimi' },
  ];

  const students: { id: number }[] = [];
  for (let i = 0; i < studentDefs.length; i++) {
    const s = studentDefs[i];
    const u = await upsertUser({
      email: s.email,
      prenom: s.prenom,
      nom: s.nom,
      nin: `100000000${String(i).padStart(6, '0')}`,
      telephone: `05500000${String(i).padStart(2, '0')}`,
      role: 'etudiant',
    });
    students.push(u);
  }

  const personnelDefs = [
    { email: 'fatima.zerrouki@bibliosphere.test', prenom: 'Fatima', nom: 'Zerrouki' },
    { email: 'ahmed.belkacem@bibliosphere.test', prenom: 'Ahmed', nom: 'Belkacem' },
  ];
  for (let i = 0; i < personnelDefs.length; i++) {
    const p = personnelDefs[i];
    await upsertUser({
      email: p.email,
      prenom: p.prenom,
      nom: p.nom,
      nin: `200000000${String(i).padStart(6, '0')}`,
      telephone: `05600000${String(i).padStart(2, '0')}`,
      role: 'personnel',
    });
  }

  // Fetch the primary demo accounts created earlier (admin/personnel/etudiant test)
  const primaryStudent = await prisma.user.findUnique({ where: { email: 'etudiant@bibliosphere.test' } });
  const allStudents = primaryStudent ? [primaryStudent, ...students] : students;

  console.log('Seeding emprunts (loans)...');

  const existingEmpruntsCount = await prisma.emprunt.count();
  if (existingEmpruntsCount === 0) {
    // Historical, returned loans spread over the last 6 months
    for (let i = 0; i < 35; i++) {
      const user = pick(allStudents);
      const book = pick(books);
      const dateEmprunt = randomDateWithinLastMonths(6);
      const dateRetour = addDays(dateEmprunt, 14);
      const returnedAt = addDays(dateEmprunt, 3 + Math.floor(Math.random() * 12));
      await prisma.emprunt.create({
        data: {
          userId: user.id,
          livreId: book.id,
          dateEmprunt,
          dateRetour,
          returnedAt,
          createdAt: dateEmprunt,
        },
      });
    }

    // Active, current loans (not yet due)
    for (let i = 0; i < 8; i++) {
      const user = i < 2 && primaryStudent ? primaryStudent : pick(allStudents);
      const book = pick(books);
      const dateEmprunt = addDays(new Date(), -(1 + Math.floor(Math.random() * 10)));
      const dateRetour = addDays(new Date(), 2 + Math.floor(Math.random() * 10));
      await prisma.emprunt.create({
        data: {
          userId: user.id,
          livreId: book.id,
          dateEmprunt,
          dateRetour,
          createdAt: dateEmprunt,
        },
      });
      await prisma.livre.update({ where: { id: book.id }, data: { stockDisponible: { decrement: 1 }, borrowedCount: { increment: 1 } } });
    }

    // Overdue loans
    for (let i = 0; i < 5; i++) {
      const user = i === 0 && primaryStudent ? primaryStudent : pick(allStudents);
      const book = pick(books);
      const dateEmprunt = addDays(new Date(), -(20 + Math.floor(Math.random() * 15)));
      const dateRetour = addDays(dateEmprunt, 14);
      await prisma.emprunt.create({
        data: {
          userId: user.id,
          livreId: book.id,
          dateEmprunt,
          dateRetour,
          createdAt: dateEmprunt,
        },
      });
      await prisma.livre.update({ where: { id: book.id }, data: { stockDisponible: { decrement: 1 }, borrowedCount: { increment: 1 } } });
    }

    console.log('Seeded 48 emprunts.');
  } else {
    console.log('Emprunts already exist, skipping.');
  }

  console.log('Seeding reservations...');

  const existingReservationsCount = await prisma.reservation.count();
  if (existingReservationsCount === 0) {
    for (let i = 0; i < 10; i++) {
      const user = i === 0 && primaryStudent ? primaryStudent : pick(allStudents);
      const book = pick(books);
      const dateReservation = randomDateWithinLastMonths(3);
      await prisma.reservation.create({
        data: {
          userId: user.id,
          livreId: book.id,
          dateReservation,
          statut: 'en_attente',
          createdAt: dateReservation,
        },
      });
    }

    for (let i = 0; i < 4; i++) {
      const user = i === 0 && primaryStudent ? primaryStudent : pick(allStudents);
      const book = pick(books);
      const dateReservation = randomDateWithinLastMonths(1);
      await prisma.reservation.create({
        data: {
          userId: user.id,
          livreId: book.id,
          dateReservation,
          dateReservationDue: addDays(new Date(), 2),
          statut: 'disponible',
          createdAt: dateReservation,
        },
      });
      await prisma.livre.update({ where: { id: book.id }, data: { reservedCount: { increment: 1 } } });
    }

    console.log('Seeded 14 reservations.');
  } else {
    console.log('Reservations already exist, skipping.');
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
