import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/services/venue.service";
import { bookingService } from "@/services/booking.service";
import { handleApiError } from "@/lib/errors";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    // Get venue by slug to get its ID
    const venue = await venueService.getVenueBySlug(slug);
    const bookings = await bookingService.getBookingsByVenue(venue.id);

    // Return only the date ranges (no sensitive booking info)
    const bookedDates = bookings
      .filter((b) => b.status !== "rejected")
      .map((b) => ({
        startDate: b.startDate,
        endDate: b.endDate,
      }));

    return NextResponse.json({ data: bookedDates });
  } catch (error) {
    const { error: apiError, status } = handleApiError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
