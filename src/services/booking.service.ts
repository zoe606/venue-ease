import { venueRepository } from "@/repositories/venue.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { AppError, ErrorCodes } from "@/lib/errors";
import type { CreateBookingInput } from "@/types";
import type { BookingInquiry } from "@prisma/client";

export const bookingService = {
  async createBooking(data: CreateBookingInput): Promise<BookingInquiry> {
    const venue = await venueRepository.findById(data.venueId);
    if (!venue) {
      throw new AppError(ErrorCodes.VENUE_NOT_FOUND, "Venue not found", 404);
    }

    if (data.attendeeCount > venue.capacity) {
      throw new AppError(
        ErrorCodes.CAPACITY_EXCEEDED,
        `Attendee count exceeds venue capacity. Maximum allowed: ${venue.capacity}`,
        400,
      );
    }

    const conflicts = await bookingRepository.findOverlapping(
      data.venueId,
      data.startDate,
      data.endDate,
    );

    if (conflicts.length > 0) {
      throw new AppError(
        ErrorCodes.DATES_UNAVAILABLE,
        "Selected dates are not available for this venue",
        409,
        {
          conflictingDates: conflicts.map((b) => ({
            startDate: b.startDate,
            endDate: b.endDate,
          })),
        },
      );
    }

    return bookingRepository.create({
      ...data,
      quotedPricePerNight: Number(venue.pricePerNight),
    });
  },

  async getBookingsByVenue(venueId: number): Promise<BookingInquiry[]> {
    return bookingRepository.findByVenueId(venueId);
  },
};
