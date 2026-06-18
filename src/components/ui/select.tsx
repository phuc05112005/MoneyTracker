"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = ({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-all duration-200 hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
  </SelectPrimitive.Trigger>
);

export const SelectContent = ({ className, children, ...props }: SelectPrimitive.SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-card p-1 shadow-soft animate-in fade-in-0 zoom-in-95 duration-100",
        className
      )}
      position="popper"
      sideOffset={4}
      {...props}
    >
      <SelectPrimitive.Viewport className="h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

export const SelectItem = ({ className, children, ...props }: SelectPrimitive.SelectItemProps) => (
  <SelectPrimitive.Item
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
