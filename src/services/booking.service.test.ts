import { describe, it, expect, vi, beforeEach } from "vitest";
import { bookingService } from "./booking.service";
import { venueRepository } from "@/repositories/venue.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { AppError, ErrorCodes } from "@/lib/errors";
import { createMockVenue, createMockBooking } from "@/test/mocks";

vi.mock("@/repositories/venue.repository", () => ({
  venueRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("@/repositories/booking.repository", () => ({
  bookingRepository: {
    findOverlapping: vi.fn(),
    create: vi.fn(),
    findByVenueId: vi.fn(),
  },
}));

const mockVenue = createMockVenue({ id: 1, capacity: 100 });

const validBookingData = {
  venueId: 1,
  companyName: "Acme Inc",
  email: "test@example.com",
  startDate: "2025-03-01",
  endDate: "2025-03-05",
  attendeeCount: 50,
};

describe("bookingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBooking", () => {
    it("creates booking when all validations pass", async () => {
      const mockBooking = createMockBooking({ venueId: 1 });

      vi.mocked(venueRepository.findById).mockResolvedValue(mockVenue);
      vi.mocked(bookingRepository.findOverlapping).mockResolvedValue([]);
      vi.mocked(bookingRepository.create).mockResolvedValue(mockBooking);

      const result = await bookingService.createBooking(validBookingData);

      expect(result).toEqual(mockBooking);
      expect(bookingRepository.create).toHaveBeenCalledWith({
        ...validBookingData,
        quotedPricePerNight: mockVenue.pricePerNight,
      });
    });

    it("throws VENUE_NOT_FOUND if venue does not exist", async () => {
      vi.mocked(venueRepository.findById).mockResolvedValue(null);

      try {
        await bookingService.createBooking(validBookingData);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.VENUE_NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });

    it("throws CAPACITY_EXCEEDED if attendeeCount exceeds venue capacity", async () => {
      vi.mocked(venueRepository.findById).mockResolvedValue(mockVenue);

      const overCapacityBooking = {
        ...validBookingData,
        attendeeCount: 150, // venue capacity is 100
      };

      try {
        await bookingService.createBooking(overCapacityBooking);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.CAPACITY_EXCEEDED);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toContain("100");
      }
    });

    it("throws DATES_UNAVAILABLE if dates overlap with existing booking", async () => {
      const existingBooking = createMockBooking({
        startDate: new Date("2025-03-02"),
        endDate: new Date("2025-03-04"),
      });

      vi.mocked(venueRepository.findById).mockResolvedValue(mockVenue);
      vi.mocked(bookingRepository.findOverlapping).mockResolvedValue([existingBooking]);

      try {
        await bookingService.createBooking(validBookingData);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.DATES_UNAVAILABLE);
        expect((error as AppError).statusCode).toBe(409);
        expect((error as AppError).details).toBeDefined();
      }
    });

    it("passes correct dates to findOverlapping", async () => {
      vi.mocked(venueRepository.findById).mockResolvedValue(mockVenue);
      vi.mocked(bookingRepository.findOverlapping).mockResolvedValue([]);
      vi.mocked(bookingRepository.create).mockResolvedValue(createMockBooking());

      await bookingService.createBooking(validBookingData);

      expect(bookingRepository.findOverlapping).toHaveBeenCalledWith(
        1,
        "2025-03-01",
        "2025-03-05"
      );
    });
  });

  describe("getBookingsByVenue", () => {
    it("returns bookings for a venue", async () => {
      const mockBookings = [
        createMockBooking({ id: 1, venueId: 1 }),
        createMockBooking({ id: 2, venueId: 1 }),
      ];

      vi.mocked(bookingRepository.findByVenueId).mockResolvedValue(mockBookings);

      const result = await bookingService.getBookingsByVenue(1);

      expect(result).toEqual(mockBookings);
      expect(bookingRepository.findByVenueId).toHaveBeenCalledWith(1);
    });
  });
});
