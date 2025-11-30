import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-16">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <SearchX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Page not found</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Button asChild>
            <Link href="/">Back to venues</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
