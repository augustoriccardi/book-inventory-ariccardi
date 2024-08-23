import Link from "next/link";
import { Photo } from "./photo";
import { Book } from "@/lib/data";

export async function BooksGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {!books.length ? (
        <p className="text-center text-muted-foreground col-span-full">
          No books found.
        </p>
      ) : (
        books.map((book, index) => (
          <Link
            href={`/${book.id}`}
            key={book.id}
            className="block transition ease-in-out md:hover:scale-105"
          >
            <Photo
              src={book.coverImg ?? "/default-image.jpg"} // Usa una imagen por defecto si `book.image` es undefined
              title={book.title}
              priority={index < 4}
            />
          </Link>
        ))
      )}
    </div>
  );
}
