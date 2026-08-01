"use client";

import { useState } from "react";
import { PRIORITIES } from "@/lib/config-schema";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
};

export function PriorityInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const available = PRIORITIES.filter((p) => !value.includes(p));

  const add = (p: string) => {
    onChange([...value, p]);
    setOpen(false);
  };

  const remove = (p: string) => onChange(value.filter((v) => v !== p));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 border border-border p-2 min-h-10">
        {value.length === 0 ? (
          <span className="text-sm text-muted-foreground px-1 self-center">
            No priorities — the bot falls back to its built-in default order.
          </span>
        ) : (
          value.map((p, i) => (
            <Badge
              key={p}
              variant="secondary"
              className="gap-1 py-1 pl-2 pr-1"
            >
              <span className="text-xs tabular-nums text-muted-foreground">
                {i + 1}.
              </span>
              {p}
              <span className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label={`Move ${p} up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${p} down`}
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${p}`}
                  onClick={() => remove(p)}
                  className="p-0.5 rounded hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </Badge>
          ))
        )}
      </div>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1 text-xs"
            )}
            disabled={available.length === 0}
          >
            <Plus className="h-3.5 w-3.5" />
            Add priority
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="start">
            {available.map((p) => (
              <button
                key={p}
                type="button"
                className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                onClick={() => add(p)}
              >
                {p}
              </button>
            ))}
            {available.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                All valid priorities are in the list.
              </p>
            )}
          </PopoverContent>
        </Popover>
        <span className="text-xs text-muted-foreground">
          Order matters — the bot picks streamers in this order.
        </span>
      </div>
    </div>
  );
}
