import { prisma } from "@/lib/prisma";
import type { BookingInquiry } from "@prisma/client";
import type { CreateBookingData } from "@/types";

export const bookingRepository = {
  async findOverlapping(
    venueId: number,
    startDate: string,
    endDate: string,
  ): Promise<BookingInquiry[]> {
    return prisma.bookingInquiry.findMany({
      where: {
        venueId,
        status: { not: "rejected" },
        AND: [
          { startDate: { lt: new Date(endDate) } },
          { endDate: { gt: new Date(startDate) } },
        ],
      },
    });
  },

  async create(data: CreateBookingData): Promise<BookingInquiry> {
    return prisma.bookingInquiry.create({
      data: {
        venueId: data.venueId,
        companyName: data.companyName,
        email: data.email,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        attendeeCount: data.attendeeCount,
        quotedPricePerNight: data.quotedPricePerNight,
        message: data.message,
      },
    });
  },

  async findByVenueId(venueId: number): Promise<BookingInquiry[]> {
    return prisma.bookingInquiry.findMany({
      where: { venueId },
      orderBy: { startDate: "asc" },
    });
  },
};
