"use client";

import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
};

export function TagInput({ value, onChange, placeholder = "Add item…" }: Props) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && value.length > 0) remove(value[value.length - 1]);
  };

  return (
    <div className="flex flex-wrap gap-1 border border-border p-2 min-h-10">
      {value.map((item) => (
        <Badge key={item} variant="secondary" className="gap-1">
          {item}
          <button type="button" onClick={() => remove(item)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 min-w-24 bg-transparent outline-none text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={placeholder}
      />
    </div>
  );
}
