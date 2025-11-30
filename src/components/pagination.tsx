"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
  pagination: PaginationMeta;
}

export function Pagination({ pagination }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { page, totalPages, total, limit } = pagination;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? "No results" : `${startItem}–${endItem} of ${total}`}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm tabular-nums px-2">
            {page} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || isPending}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
