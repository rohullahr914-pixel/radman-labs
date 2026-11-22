"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap page-head">
      <h1>Something went wrong.</h1>
      <p className="my-6">Please try again in a moment.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
