"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  limit: number;
  status: string;
  pageSizes: number[];
  pageSizeOnly?: boolean;
};

export function PaginationControls({
  page,
  totalPages,
  limit,
  status,
  pageSizes,
  pageSizeOnly = false,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  // Preserve existing query parameters
  const navigate = (newPage: number, newLimit = limit) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("status", status);
    params.set("page", String(newPage));
    params.set("limit", String(newLimit));

    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requested = Number.parseInt(pageInput, 10);

    if (!Number.isFinite(requested)) {
      setPageInput(String(page));
      return;
    }

    const nextPage = Math.min(Math.max(requested, 1), totalPages);

    setPageInput(String(nextPage));
    navigate(nextPage);
  };

  const handleLimitChange = (value: string | null) => {
    if (!value) return;

    navigate(1, Number(value));
  };
  // Rows per page selector
  if (pageSizeOnly) {
    return (
      <Select value={String(limit)} onValueChange={handleLimitChange}>
        <SelectTrigger className="w-21.25">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {pageSizes.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Previous */}
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => navigate(page - 1)}
      >
        Previous
      </Button>

      {/* Current page */}
      <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={(event) => setPageInput(event.target.value)}
          className="h-9 w-[65px] text-center"
          aria-label="Go to page"
        />

        <span className="whitespace-nowrap text-sm text-muted-foreground">
          of {totalPages}
        </span>

        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={totalPages <= 1}
        >
          Go
        </Button>
      </form>

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => navigate(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
