import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import pLimit from "p-limit"; // Importa p-limit

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const filePath = path.resolve(__dirname, "../scripts/books.csv");
const concurrencyLimit = 10; // Puedes ajustar este valor según tus necesidades
const limit = pLimit(concurrencyLimit); // Define el límite de concurrencia

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

  // Procesa todos los registros con límite de concurrencia
  const promises = bookData.map((book, index) =>
    limit(async () => {
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
        // Utility function to validate date
        const isValidDate = (dateString) => {
          const date = new Date(dateString);

          // Checks if the date is valid and falls within the valid range of JavaScript Date object
          if (isNaN(date.getTime())) {
            return false; // Invalid date format
          }

          // Validate if the year is within a reasonable range (e.g., between 1900 and 2100)
          const year = date.getUTCFullYear();
          if (year < 1900 || year > 2100) {
            return false; // Date is out of range
          }

          return true;
        };

        // Insert book data with date validation
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
            publishDate:
              book.publishDate && isValidDate(book.publishDate)
                ? new Date(book.publishDate)
                : null,
            firstPublishDate:
              book.firstPublishDate && isValidDate(book.firstPublishDate)
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
    })
  );

  await Promise.all(promises);
  console.log(`Seeded ${bookData.length} books`);
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
