import { Suspense } from "react";
import { VenueFilters } from "@/components/venue-filters";
import { VenueList } from "@/components/venue-list";
import { Pagination } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { venueService } from "@/services/venue.service";

interface SearchParams {
  search?: string;
  minCapacity?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

function VenueListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="aspect-video" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function VenueListWrapper({ searchParams }: { searchParams: SearchParams }) {
  const { data: venues, pagination } = await venueService.getVenues({
    search: searchParams.search,
    minCapacity: searchParams.minCapacity ? Number(searchParams.minCapacity) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    page: searchParams.page ? Number(searchParams.page) : undefined,
    limit: searchParams.limit ? Number(searchParams.limit) : undefined,
  });

  return (
    <>
      <VenueList venues={venues} />
      <Pagination pagination={pagination} />
    </>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Venue</h1>
        <p className="text-muted-foreground">
          Browse our curated selection of venues for your next team offsite or corporate event
        </p>
      </div>

      <Suspense fallback={null}>
        <VenueFilters />
      </Suspense>

      <Suspense fallback={<VenueListSkeleton />}>
        <VenueListWrapper searchParams={params} />
      </Suspense>
    </div>
  );
}
