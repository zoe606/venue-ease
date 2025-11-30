import { z } from "zod";

// Venue filter schema
export const venueFiltersSchema = z.object({
  search: z.string().optional(),
  minCapacity: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type VenueFiltersInput = z.infer<typeof venueFiltersSchema>;

// Booking creation schema
export const createBookingSchema = z
  .object({
    venueId: z.number().int().positive("Venue ID is required"),
    companyName: z.string().min(1, "Company name is required").max(255),
    email: z.string().email("Invalid email address"),
    startDate: z.string().date("Invalid start date format"),
    endDate: z.string().date("Invalid end date format"),
    attendeeCount: z.number().int().positive("Attendee count must be positive"),
    message: z.string().max(1000).optional(),
  })
  .refine(
    (data) => new Date(data.startDate) >= new Date(new Date().toDateString()),
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
