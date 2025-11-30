import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/booking.service";
import { createBookingSchema } from "@/lib/validations";
import { handleApiError, AppError, ErrorCodes } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = createBookingSchema.safeParse(body);

    if (!parseResult.success) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid request body",
        400,
        parseResult.error.flatten().fieldErrors
      );
    }

    const booking = await bookingService.createBooking(parseResult.data);

    return NextResponse.json(
      { data: booking, message: "Booking inquiry submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    const { error: apiError, status } = handleApiError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
