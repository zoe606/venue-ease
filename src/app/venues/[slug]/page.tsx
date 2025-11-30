import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookingForm } from "@/components/booking-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, ArrowLeft, Check } from "lucide-react";
import { venueService } from "@/services/venue.service";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let venue;
  try {
    venue = await venueService.getVenueBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venues
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            {venue.imageUrl ? (
              <Image
                src={venue.imageUrl}
                alt={venue.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
            <div className="flex items-center gap-1 text-muted-foreground mb-4">
              <MapPin className="h-5 w-5" />
              <span>{venue.address}</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="secondary" className="text-base py-1 px-3">
                <Users className="h-4 w-4 mr-1" />
                Up to {venue.capacity} attendees
              </Badge>
              <Badge variant="secondary" className="text-base py-1 px-3">
                {formatPrice(venue.pricePerNight)}/night
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About this venue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {venue.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {venue.amenities && venue.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="py-1">
                        <Check className="h-3 w-3 mr-1" />
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <BookingForm venue={venue} />
          </div>
        </div>
      </div>
    </div>
  );
}
