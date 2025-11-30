import type { Venue, BookingInquiry } from "@prisma/client";

export type { Venue, BookingInquiry };

// API Response types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VenueListResponse {
  data: Venue[];
  pagination: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// Filter types
export interface VenueFilters {
  search?: string;
  minCapacity?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Input types for services
export interface CreateBookingInput {
  venueId: number;
  companyName: string;
  email: string;
  startDate: string;
  endDate: string;
  attendeeCount: number;
  message?: string;
}

export interface CreateBookingData extends CreateBookingInput {
  quotedPricePerNight: number;
}
