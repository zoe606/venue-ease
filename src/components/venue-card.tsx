import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Venue } from "@/types";

interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {

  return (
    <Link href={`/venues/${venue.slug}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {venue.imageUrl ? (
            <Image
              src={venue.imageUrl}
              alt={venue.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{venue.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span>{venue.city}</span>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {venue.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Up to {venue.capacity}
            </Badge>
            <Badge variant="secondary">
              {formatPrice(venue.pricePerNight)}/night
            </Badge>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full">View Details</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
