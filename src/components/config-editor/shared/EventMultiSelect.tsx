"use client";

import { ALL_EVENTS } from "@/lib/config-schema";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
};

export function EventMultiSelect({ value, onChange }: Props) {
  const toggle = (event: string) => {
    if (value.includes(event)) onChange(value.filter((e) => e !== event));
    else onChange([...value, event]);
  };

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-between h-auto min-h-10 flex-wrap gap-1"
        )}
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground">Select events…</span>
        ) : (
          value.map((e) => <Badge key={e} variant="secondary">{e}</Badge>)
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2 max-h-72 overflow-y-auto">
        {ALL_EVENTS.map((event) => (
          <button
            key={event}
            type="button"
            className={cn(
              "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent",
              value.includes(event) && "font-medium"
            )}
            onClick={() => toggle(event)}
          >
            <Check className={cn("h-4 w-4", value.includes(event) ? "opacity-100" : "opacity-0")} />
            {event}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
