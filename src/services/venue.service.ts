import { venueRepository } from "@/repositories/venue.repository";
import { AppError, ErrorCodes } from "@/lib/errors";
import type { VenueFilters, VenueListResponse } from "@/types";
import type { Venue } from "@prisma/client";

export const venueService = {
  async getVenues(filters: VenueFilters): Promise<VenueListResponse> {
    const { page = 1, limit = 10 } = filters;
    const { venues, total } = await venueRepository.findMany(filters);

    return {
      data: venues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getVenueById(id: number): Promise<Venue> {
    const venue = await venueRepository.findById(id);

    if (!venue) {
      throw new AppError(
        ErrorCodes.VENUE_NOT_FOUND,
        "Venue not found",
        404
      );
    }

    return venue;
  },

  async getVenueBySlug(slug: string): Promise<Venue> {
    const venue = await venueRepository.findBySlug(slug);

    if (!venue) {
      throw new AppError(
        ErrorCodes.VENUE_NOT_FOUND,
        "Venue not found",
        404
      );
    }

    return venue;
  },
};
