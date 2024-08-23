import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const filePath = path.resolve(__dirname, "../scripts/books.csv");

console.log(`Intentando leer el archivo en: ${filePath}`);

// Función para parsear el archivo CSV
const parseCSV = async (filePath) => {
  const csvFile = fs.readFileSync(filePath, "utf8");
  return new Promise((resolve) => {
    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
    });
  });
};

// Función para sembrar datos de libros
const seedBooks = async (bookData) => {
  // Eliminar todos los registros existentes
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();

  // Crear un mapa para autores
  const authorsMap = new Map();

  // Crear nuevos registros para los primeros 100 libros
  const batchSize = 1000;
  const batch = bookData.slice(0, batchSize);

  const promises = batch.map(async (book, index) => {
    if (!book.isbn) {
      console.error(`Skipping book at index ${index} due to missing ISBN`);
      return Promise.resolve();
    }

    // Manejar autores y obtener authorId
    const authorName = book.author.trim();
    let authorId = authorsMap.get(authorName);

    if (!authorId) {
      try {
        const newAuthor = await prisma.author.create({
          data: { name: authorName },
        });
        authorId = newAuthor.id;
        authorsMap.set(authorName, authorId);
      } catch (error) {
        console.error(
          `Failed to create author for book at index ${index}:`,
          error
        );
        return Promise.resolve(); // Continúa con el siguiente libro si falla
      }
    }

    // Insertar datos del libro en la base de datos
    try {
      await prisma.book.create({
        data: {
          bookId: book.bookId,
          title: book.title,
          series: book.series || null,
          authorId: authorId,
          rating: book.rating ? parseFloat(book.rating) : null,
          description: book.description || null,
          language: book.language || null,
          isbn: book.isbn,
          genres: book.genres || null,
          characters: book.characters || null,
          bookFormat: book.bookFormat || null,
          edition: book.edition || null,
          pages: book.pages ? parseInt(book.pages) : null,
          publisher: book.publisher || null,
          publishDate: book.publishDate ? new Date(book.publishDate) : null,
          firstPublishDate: book.firstPublishDate
            ? new Date(book.firstPublishDate)
            : null,
          awards: book.awards || null,
          numRatings: book.numRatings ? parseInt(book.numRatings) : null,
          ratingsByStars: book.ratingsByStars || null,
          likedPercent: book.likedPercent
            ? parseFloat(book.likedPercent)
            : null,
          setting: book.setting || null,
          coverImg: book.coverImg || null,
          bbeScore: book.bbeScore ? parseFloat(book.bbeScore) : null,
          bbeVotes: book.bbeVotes ? parseInt(book.bbeVotes) : null,
          price: book.price ? parseFloat(book.price) : null,
        },
      });
    } catch (error) {
      console.error(`Failed to create book at index ${index}:`, error);
    }
  });

  await Promise.all(promises);
  console.log(`Seeded ${batch.length} books`);
};

// Función principal de seed
async function seed() {
  const bookData = await parseCSV(filePath);
  await seedBooks(bookData);
}

// Función principal
async function main() {
  try {
    await seed();
  } catch (err) {
    console.error(
      "An error occurred while attempting to seed the database:",
      err
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();
