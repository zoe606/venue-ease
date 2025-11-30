import type { Venue, BookingInquiry, Prisma } from "@prisma/client";

type MockVenue = Omit<Venue, "pricePerNight"> & {
  pricePerNight: Prisma.Decimal | number;
};
type MockBooking = Omit<BookingInquiry, "quotedPricePerNight"> & {
  quotedPricePerNight: Prisma.Decimal | number;
};

export function createMockVenue(overrides: Partial<MockVenue> = {}): Venue {
  return {
    id: 1,
    slug: "test-venue-san-francisco",
    name: "Test Venue",
    city: "San Francisco",
    address: "123 Test St",
    capacity: 100,
    pricePerNight: 500,
    description: "A test venue",
    imageUrl: "https://example.com/image.jpg",
    amenities: ["WiFi", "Parking"],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Venue;
}

export function createMockBooking(
  overrides: Partial<MockBooking> = {},
): BookingInquiry {
  return {
    id: 1,
    venueId: 1,
    companyName: "Test Company",
    email: "test@example.com",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-03"),
    attendeeCount: 50,
    status: "pending",
    message: null,
    quotedPricePerNight: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as BookingInquiry;
}
