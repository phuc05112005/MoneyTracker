"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, className, indicatorClassName }: { value?: number; className?: string; indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root className={cn("h-3 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <ProgressPrimitive.Indicator
        className={cn("h-full bg-primary transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - Math.min(value, 100)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
