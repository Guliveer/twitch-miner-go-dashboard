"use client";

import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function DurationInput({ value, onChange, placeholder = "120s" }: Props) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
