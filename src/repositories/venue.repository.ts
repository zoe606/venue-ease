import { prisma } from "@/lib/prisma";
import type { Venue } from "@prisma/client";
import type { VenueFilters } from "@/types";

export interface VenueWithCount {
  venues: Venue[];
  total: number;
}

export const venueRepository = {
  async findMany(filters: VenueFilters): Promise<VenueWithCount> {
    const { search, minCapacity, maxPrice, page = 1, limit = 10 } = filters;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(minCapacity && {
        capacity: {
          gte: minCapacity,
        },
      }),
      ...(maxPrice && {
        pricePerNight: {
          lte: maxPrice,
        },
      }),
    };

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.venue.count({ where }),
    ]);

    return { venues, total };
  },

  async findById(id: number): Promise<Venue | null> {
    return prisma.venue.findUnique({
      where: { id },
    });
  },

  async findBySlug(slug: string): Promise<Venue | null> {
    return prisma.venue.findUnique({
      where: { slug },
    });
  },
};
