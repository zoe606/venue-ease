import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/services/venue.service";
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
    const venue = await venueService.getVenueBySlug(slug);

    return NextResponse.json({ data: venue });
  } catch (error) {
    const { error: apiError, status } = handleApiError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
