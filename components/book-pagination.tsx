"use client";

import Form from "next/form";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

function FormValues({
  searchParams,
  pageNumber,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  pageNumber: number;
}) {
  let { pending } = useFormStatus();

  return (
    <div data-pending={pending ? "" : undefined}>
      {/* Keep the existing search params */}
      {Object.entries(searchParams).map(
        ([key, value]) =>
          key !== "page" && (
            <input key={key} type="hidden" name={key} value={value as string} />
          )
      )}
      <input type="hidden" name="page" value={pageNumber.toString()} />
    </div>
  );
}

export function BookPagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const getPageNumbers = () => {
    const pageNumbers = [];
    // Siempre empieza en 1
    pageNumbers.push(1);
    // Si hay más de 2 páginas agrega ...
    if (currentPage > 3) pageNumbers.push("...");
    // Muestra los números entre un rango definido
    for (
      // si estoy en pag mayor a 2 muestra los números desde pag siguiente hasta el número menor entre la pag actual o el total - 1. Si estoy en la pag 1 muestra desde 2 hasta 2.
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pageNumbers.push(i);
    }
    // Mostrar ... si estoy a 2 menos del total de páginas
    if (currentPage < totalPages - 2) pageNumbers.push("...");
    // Siempre voy a mostrar el total de páginas
    if (totalPages > 1 && !pageNumbers.includes(totalPages))
      pageNumbers.push(totalPages);
    return pageNumbers;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Form action="/">
            <FormValues
              searchParams={searchParams}
              pageNumber={Math.max(1, currentPage - 1)}
            />
            <Button
              variant="ghost"
              type="submit"
              size="icon"
              disabled={currentPage <= 1}
            >
              ←
            </Button>
          </Form>
        </PaginationItem>

        {/* Mobile View */}
        <div className="flex md:hidden">
          <PaginationItem>
            <Form action="/">
              <FormValues
                searchParams={searchParams}
                pageNumber={currentPage}
              />
              <Button type="submit" variant="outline">
                {currentPage}
              </Button>
            </Form>
          </PaginationItem>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex">
          {getPageNumbers().map((pageNumber, index) => (
            <PaginationItem key={index}>
              {pageNumber === "..." ? (
                <PaginationEllipsis />
              ) : (
                <Form action="/">
                  <FormValues
                    searchParams={searchParams}
                    pageNumber={pageNumber as number}
                  />
                  <Button
                    type="submit"
                    variant={pageNumber === currentPage ? "outline" : "ghost"}
                  >
                    {pageNumber}
                  </Button>
                </Form>
              )}
            </PaginationItem>
          ))}
        </div>

        <PaginationItem>
          <Form action="/">
            <FormValues
              searchParams={searchParams}
              pageNumber={Math.min(totalPages, currentPage + 1)}
            />
            <Button
              variant="ghost"
              type="submit"
              size="icon"
              disabled={currentPage >= totalPages}
            >
              →
            </Button>
          </Form>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
