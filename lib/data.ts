import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface Book {
  id: string;
  bookId: string;
  title: string;
  series?: string | null;
  author: string;
  rating?: number | null;
  description?: string | null;
  language?: string | null;
  isbn: string;
  genres?: string | null;
  characters?: string | null;
  bookFormat?: string | null;
  edition?: string | null;
  pages?: number | null;
  publisher?: string | null;
  publishDate?: Date | null;
  firstPublishDate?: Date | null;
  awards?: string | null;
  numRatings?: number | null;
  ratingsByStars?: string | null;
  likedPercent?: number | null;
  setting?: string | null;
  coverImg?: string | null;
  bbeScore?: number | null;
  bbeVotes?: number | null;
  price?: number | null;
}

interface PaginatedBooksResponse {
  books: Book[];
  pagination: Pagination;
}

export async function fetchBooksWithPagination(searchParams: {
  q?: string;
  author?: string | string[];
  page?: string;
}): Promise<PaginatedBooksResponse> {
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 10; // Adjust the page size as needed

  try {
    // Build the search filter
    const where: any = {};
    if (searchParams.q) {
      where.title = { contains: searchParams.q, mode: "insensitive" };
    }
    if (searchParams.author) {
      where.author = {
        name: {
          in: Array.isArray(searchParams.author)
            ? searchParams.author
            : [searchParams.author],
        },
      };
    }

    // Calculate the total number of books matching the filter
    const totalItems = await prisma.book.count({
      where: {
        ...where,
      },
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / pageSize);

    // Adjust the current page if it's less than 1 or greater than the total pages
    const currentPage = Math.max(1, Math.min(page, totalPages));

    // Get the books for the current page
    const books = await prisma.book.findMany({
      where: {
        ...where,
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: {
        publishDate: "desc", // Adjust the order as needed
      },
      include: {
        author: true, // Include author information
      },
    });

    // Map the fetched books to include the author's name
    const formattedBooks: Book[] = books.map((book) => ({
      id: book.id,
      bookId: book.bookId,
      title: book.title,
      series: book.series,
      author: book.author.name, // Use the author's name
      rating: book.rating,
      description: book.description,
      language: book.language,
      isbn: book.isbn,
      genres: book.genres,
      characters: book.characters,
      bookFormat: book.bookFormat,
      edition: book.edition,
      pages: book.pages,
      publisher: book.publisher,
      publishDate: book.publishDate,
      firstPublishDate: book.firstPublishDate,
      awards: book.awards,
      numRatings: book.numRatings,
      ratingsByStars: book.ratingsByStars,
      likedPercent: book.likedPercent,
      setting: book.setting,
      coverImg: book.coverImg,
      bbeScore: book.bbeScore,
      bbeVotes: book.bbeVotes,
      price: book.price,
    }));

    return {
      books: formattedBooks,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
      },
    };
  } catch (error) {
    console.error("Failed to fetch books:", error);
    throw new Error("Failed to fetch books");
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchAuthors(): Promise<string[]> {
  try {
    // Fetch all authors from the database
    const authors = await prisma.author.findMany({
      select: {
        name: true, // Only select the author's name
      },
    });

    // Extract author names
    return authors.map((author) => author.name);
  } catch (error) {
    console.error("Failed to fetch authors:", error);
    throw new Error("Failed to fetch authors");
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchBookById(id: string): Promise<Book> {
  try {
    // Fetch the book by its ID, including the author relationship
    const book = await prisma.book.findUnique({
      where: {
        id, // Asegúrate de convertir el ID a número si es necesario
      },
      include: {
        author: true, // Incluye la relación con el autor
      },
    });

    if (!book) {
      throw new Error(`Book with ID ${id} not found.`);
    }

    // Transform the book object to include the author's name
    return {
      id: book.id,
      bookId: book.bookId,
      title: book.title,
      series: book.series,
      author: book.author?.name || "Unknown",
      rating: book.rating,
      description: book.description,
      language: book.language,
      isbn: book.isbn,
      genres: book.genres,
      characters: book.characters,
      bookFormat: book.bookFormat,
      edition: book.edition,
      pages: book.pages,
      publisher: book.publisher,
      publishDate: book.publishDate,
      firstPublishDate: book.firstPublishDate,
      awards: book.awards,
      numRatings: book.numRatings,
      ratingsByStars: book.ratingsByStars,
      likedPercent: book.likedPercent,
      setting: book.setting,
      coverImg: book.coverImg,
      bbeScore: book.bbeScore,
      bbeVotes: book.bbeVotes,
      price: book.price,
    };
  } catch (error) {
    console.error(`Failed to fetch book with ID ${id}:`, error);
    throw new Error(`Failed to fetch book with ID ${id}`);
  } finally {
    await prisma.$disconnect();
  }
}
