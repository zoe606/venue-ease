"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";

const LIMIT_OPTIONS = ["5", "10", "20", "50"];

export function VenueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minCapacity, setMinCapacity] = useState(
    searchParams.get("minCapacity") || "",
  );
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const limit = searchParams.get("limit") || "10";

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const pushUrl = useCallback(
    (filters: { search: string; minCapacity: string; maxPrice: string }) => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.minCapacity) params.set("minCapacity", filters.minCapacity);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

      // Preserve limit
      const currentLimit = searchParams.get("limit");
      if (currentLimit && currentLimit !== "10") {
        params.set("limit", currentLimit);
      }

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      startTransition(() => {
        router.push(newUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const handleFilterChange = useCallback(
    (newSearch: string, newMinCapacity: string, newMaxPrice: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        pushUrl({
          search: newSearch,
          minCapacity: newMinCapacity,
          maxPrice: newMaxPrice,
        });
      }, 300);
    },
    [pushUrl],
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    handleFilterChange(value, minCapacity, maxPrice);
  };

  const onMinCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinCapacity(value);
    handleFilterChange(search, value, maxPrice);
  };

  const onMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPrice(value);
    handleFilterChange(search, minCapacity, value);
  };

  const handleLimitChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "10") {
        params.delete("limit");
      } else {
        params.set("limit", value);
      }
      params.delete("page");

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      startTransition(() => {
        router.push(newUrl, { scroll: false });
      });
    },
    [router, searchParams, pathname],
  );

  const clearFilters = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setSearch("");
    setMinCapacity("");
    setMaxPrice("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

  const hasFilters = search || minCapacity || maxPrice;

  return (
    <div className="mb-6 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search venues or city..."
          value={search}
          onChange={onSearchChange}
          className="pl-10 h-11"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <Input
          type="number"
          placeholder="Min capacity"
          min="1"
          value={minCapacity}
          onChange={onMinCapacityChange}
          className="w-32 h-9"
        />

        <Input
          type="number"
          placeholder="Max price"
          min="1"
          value={maxPrice}
          onChange={onMaxPriceChange}
          className="w-32 h-9"
        />

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={limit} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        {isPending && (
          <span className="text-sm text-muted-foreground animate-pulse">
            Loading...
          </span>
        )}
      </div>
    </div>
  );
}
