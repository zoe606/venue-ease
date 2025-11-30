import { VenueCard } from "@/components/venue-card";
import type { Venue } from "@/types";

interface VenueListProps {
  venues: Venue[];
}

export function VenueList({ venues }: VenueListProps) {
  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">
          No venues found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
