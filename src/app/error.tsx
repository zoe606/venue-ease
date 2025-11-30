"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-16">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Go home
            </Button>
            <Button onClick={reset}>Try again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
