"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = [
  { label: "30 seconds", value: "30s" },
  { label: "1 minute", value: "1m0s" },
  { label: "2 minutes", value: "2m0s" },
  { label: "3 minutes", value: "3m0s" },
  { label: "5 minutes", value: "5m0s" },
  { label: "10 minutes", value: "10m0s" },
  { label: "15 minutes", value: "15m0s" },
  { label: "30 minutes", value: "30m0s" },
  { label: "1 hour", value: "1h0m0s" },
  { label: "2 hours", value: "2h0m0s" },
  { label: "4 hours", value: "4h0m0s" },
  { label: "6 hours", value: "6h0m0s" },
  { label: "12 hours", value: "12h0m0s" },
  { label: "24 hours", value: "24h0m0s" },
] as const;

const CUSTOM = "__custom__";

function isPreset(value: string): boolean {
  return PRESETS.some((p) => p.value === value);
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function DurationInput({ value, onChange, className }: Props) {
  const [customValue, setCustomValue] = useState(isPreset(value) ? "" : value);

  const handleSelect = (v: string | null) => {
    if (!v) return;
    if (v === CUSTOM) {
      setCustomValue("");
      onChange("");
    } else {
      setCustomValue("");
      onChange(v);
    }
  };

  const handleCustomChange = (v: string) => {
    setCustomValue(v);
    onChange(v);
  };

  const selectValue = isPreset(value) ? value : CUSTOM;

  return (
    <div className={className}>
      <Select value={selectValue} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select interval…" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM}>
            <span className="text-muted-foreground italic">Custom</span>
          </SelectItem>
        </SelectContent>
      </Select>
      {selectValue === CUSTOM && (
        <Input
          value={customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="e.g. 2m30s, 90s, 1h15m0s"
          className="mt-2"
        />
      )}
    </div>
  );
}
