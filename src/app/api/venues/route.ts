import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/services/venue.service";
import { venueFiltersSchema } from "@/lib/validations";
import { handleApiError, AppError, ErrorCodes } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawFilters = {
      search: searchParams.get("search") || undefined,
      minCapacity: searchParams.get("minCapacity") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parseResult = venueFiltersSchema.safeParse(rawFilters);

    if (!parseResult.success) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid query parameters",
        400,
        parseResult.error.flatten().fieldErrors
      );
    }

    const response = await venueService.getVenues(parseResult.data);

    return NextResponse.json(response);
  } catch (error) {
    const { error: apiError, status } = handleApiError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
