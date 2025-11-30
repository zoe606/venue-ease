import type { Venue, VenueListResponse, VenueFilters, CreateBookingInput, BookingInquiry } from "@/types";

function getBaseUrl(): string {
  // Client-side: use relative URL
  if (typeof window !== "undefined") {
    return "";
  }
  // Server-side: need absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate, ...fetchOptions } = options ?? {};
  const url = `${getBaseUrl()}${endpoint}`;

  const isGetRequest = !fetchOptions.method || fetchOptions.method === "GET";

  const response = await fetch(url, {
    ...(isGetRequest && { next: { revalidate: revalidate ?? 60 } }),
    ...fetchOptions,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error?.message || `API error: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export const api = {
  venues: {
    async list(filters?: VenueFilters): Promise<VenueListResponse> {
      const params = new URLSearchParams();

      if (filters?.search) params.set("search", filters.search);
      if (filters?.minCapacity) params.set("minCapacity", String(filters.minCapacity));
      if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.limit) params.set("limit", String(filters.limit));

      const query = params.toString();
      return fetchApi<VenueListResponse>(`/api/venues${query ? `?${query}` : ""}`);
    },

    async getBySlug(slug: string): Promise<Venue | null> {
      try {
        const { data } = await fetchApi<{ data: Venue }>(`/api/venues/${slug}`);
        return data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },

    async getBookings(slug: string): Promise<{ startDate: string; endDate: string }[]> {
      const { data } = await fetchApi<{ data: { startDate: string; endDate: string }[] }>(
        `/api/venues/${slug}/bookings`
      );
      return data;
    },
  },

  bookings: {
    async create(input: CreateBookingInput): Promise<BookingInquiry> {
      const { data } = await fetchApi<{ data: BookingInquiry }>("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return data;
    },
  },
};
