"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Venue } from "@/types";

interface BookedDateRange {
  startDate: string;
  endDate: string;
}

interface BookingFormProps {
  venue: Venue;
}

export function BookingForm({ venue }: BookingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  useEffect(() => {
    async function fetchBookedDates() {
      try {
        const data = await api.venues.getBookings(venue.slug);

        const allBookedDates: Date[] = [];
        data.forEach((range: BookedDateRange) => {
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);
          const dates = eachDayOfInterval({ start, end });
          allBookedDates.push(...dates);
        });

        setBookedDates(allBookedDates);
      } catch (error) {
        console.error("Failed to fetch booked dates:", error);
      }
    }

    fetchBookedDates();
  }, [venue.slug]);

  const isDateBooked = (date: Date): boolean => {
    return bookedDates.some(
      (bookedDate) =>
        bookedDate.getFullYear() === date.getFullYear() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getDate() === date.getDate(),
    );
  };

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    attendeeCount: "",
    message: "",
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.attendeeCount) {
      newErrors.attendeeCount = "Attendee count is required";
    } else if (Number(formData.attendeeCount) > venue.capacity) {
      newErrors.attendeeCount = `Maximum capacity is ${venue.capacity}`;
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if (startDate && endDate && endDate <= startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await api.bookings.create({
        venueId: venue.id,
        companyName: formData.companyName,
        email: formData.email,
        startDate: format(startDate!, "yyyy-MM-dd"),
        endDate: format(endDate!, "yyyy-MM-dd"),
        attendeeCount: Number(formData.attendeeCount),
        message: formData.message || undefined,
      });

      toast.success("Booking inquiry submitted!", {
        description: "We'll get back to you soon.",
      });

      setFormData({
        companyName: "",
        email: "",
        attendeeCount: "",
        message: "",
      });
      setStartDate(undefined);
      setEndDate(undefined);
      setErrors({});

      router.refresh();
    } catch (error) {
      toast.error("Failed to submit booking", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Booking Inquiry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="Your company name"
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendeeCount">
              Number of Attendees * (Max: {venue.capacity})
            </Label>
            <Input
              id="attendeeCount"
              type="number"
              min="1"
              max={venue.capacity}
              value={formData.attendeeCount}
              onChange={(e) =>
                setFormData({ ...formData, attendeeCount: e.target.value })
              }
              placeholder="e.g. 50"
            />
            {errors.attendeeCount && (
              <p className="text-sm text-destructive">{errors.attendeeCount}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date() || isDateBooked(date)}
                    modifiers={{ booked: bookedDates }}
                    modifiersClassNames={{
                      booked: "bg-red-100 text-red-500 line-through",
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) =>
                      date < new Date() ||
                      (startDate ? date <= startDate : false) ||
                      isDateBooked(date)
                    }
                    modifiers={{ booked: bookedDates }}
                    modifiersClassNames={{
                      booked: "bg-red-100 text-red-500 line-through",
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Any additional details or requirements..."
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
