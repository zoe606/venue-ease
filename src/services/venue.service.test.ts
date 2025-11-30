import { describe, it, expect, vi, beforeEach } from "vitest";
import { venueService } from "./venue.service";
import { venueRepository } from "@/repositories/venue.repository";
import { AppError, ErrorCodes } from "@/lib/errors";
import { createMockVenue } from "@/test/mocks";

vi.mock("@/repositories/venue.repository", () => ({
  venueRepository: {
    findMany: vi.fn(),
    findBySlug: vi.fn(),
  },
}));

describe("venueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getVenues", () => {
    it("returns venues with pagination metadata", async () => {
      const mockVenues = [
        createMockVenue({ id: 1, name: "Venue 1", city: "San Francisco" }),
        createMockVenue({ id: 2, name: "Venue 2", city: "New York" }),
      ];

      vi.mocked(venueRepository.findMany).mockResolvedValue({
        venues: mockVenues,
        total: 2,
      });

      const result = await venueService.getVenues({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("applies filters to repository call", async () => {
      vi.mocked(venueRepository.findMany).mockResolvedValue({
        venues: [],
        total: 0,
      });

      await venueService.getVenues({
        city: "San Francisco",
        minCapacity: 50,
        maxPrice: 500,
        page: 2,
        limit: 5,
      });

      expect(venueRepository.findMany).toHaveBeenCalledWith({
        city: "San Francisco",
        minCapacity: 50,
        maxPrice: 500,
        page: 2,
        limit: 5,
      });
    });

    it("calculates totalPages correctly", async () => {
      vi.mocked(venueRepository.findMany).mockResolvedValue({
        venues: [],
        total: 25,
      });

      const result = await venueService.getVenues({ page: 1, limit: 10 });

      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe("getVenueBySlug", () => {
    it("returns venue when found", async () => {
      const mockVenue = createMockVenue({ slug: "test-venue" });

      vi.mocked(venueRepository.findBySlug).mockResolvedValue(mockVenue);

      const result = await venueService.getVenueBySlug("test-venue");

      expect(result).toEqual(mockVenue);
    });

    it("throws VENUE_NOT_FOUND when venue does not exist", async () => {
      vi.mocked(venueRepository.findBySlug).mockResolvedValue(null);

      await expect(venueService.getVenueBySlug("nonexistent")).rejects.toThrow(AppError);

      try {
        await venueService.getVenueBySlug("nonexistent");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.VENUE_NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });
});
