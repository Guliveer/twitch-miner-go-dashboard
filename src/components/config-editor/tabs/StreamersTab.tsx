"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const FORCED_STREAMER = "guliveer_";
const CHAT_MODES = ["ALWAYS", "NEVER", "ONLINE", "OFFLINE"] as const;
const STREAMER_BOOL_KEYS = [
  "make_predictions",
  "follow_raid",
  "claim_drops",
  "claim_moments",
  "watch_streak",
  "community_goals",
  "drops_only",
] as const;

export function StreamersTab({ isAdmin }: { isAdmin: boolean }) {
  const { register, watch, setValue, control } =
    useFormContext<AccountConfigForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "streamers",
  });

  const visibleFields = isAdmin
    ? fields.map((f, i) => ({ ...f, originalIndex: i }))
    : fields
        .map((f, i) => ({ ...f, originalIndex: i }))
        .filter((f) => watch(`streamers.${f.originalIndex}.username`) !== FORCED_STREAMER);

  const addStreamer = () => append({ username: "", settings: undefined });

  return (
    <div className="space-y-6">
      {/* Default settings for all streamers */}
      <div className="border border-border p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider">Default settings for all streamers</p>
        <p className="text-xs text-muted-foreground -mt-2">
          These apply to every streamer unless overridden individually.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {STREAMER_BOOL_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <Switch
                checked={watch(`streamer_defaults.${key}`) ?? false}
                onCheckedChange={(v) => setValue(`streamer_defaults.${key}`, v)}
              />
              <Label className="text-xs">{key.replace(/_/g, " ")}</Label>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Default chat presence</Label>
          <Select
            value={watch("streamer_defaults.chat") ?? "ONLINE"}
            onValueChange={(v) => setValue("streamer_defaults.chat", v as typeof CHAT_MODES[number])}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {visibleFields.length} streamer{visibleFields.length !== 1 ? "s" : ""}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addStreamer}>
          Add streamer
        </Button>
      </div>

      <Accordion multiple className="space-y-2">
        {visibleFields.map(({ id, originalIndex: i }) => (
          <AccordionItem
            key={id}
            value={id}
            className="border border-border px-3"
          >
            <AccordionTrigger className="py-3">
              <span className="text-sm font-medium">
                {watch(`streamers.${i}.username`) || (
                  <span className="text-muted-foreground italic">unnamed</span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  {...register(`streamers.${i}.username`)}
                  placeholder="streamer_name"
                />
              </div>

              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Per-streamer overrides
              </p>

              <div className="grid grid-cols-2 gap-3">
                {STREAMER_BOOL_KEYS.map((key) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{key.replace(/_/g, " ")}</Label>
                    <Select
                      value={
                        watch(`streamers.${i}.settings.${key}`) === undefined
                          ? ""
                          : String(watch(`streamers.${i}.settings.${key}`))
                      }
                      onValueChange={(v) =>
                        setValue(
                          `streamers.${i}.settings.${key}`,
                          v === "" ? undefined : v === "true",
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Inherit from defaults" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          <span className="text-muted-foreground italic">Inherit from defaults</span>
                        </SelectItem>
                        <SelectItem value="true">✓ On</SelectItem>
                        <SelectItem value="false">✗ Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <Label>Chat presence</Label>
                <Select
                  value={watch(`streamers.${i}.settings.chat`) ?? ""}
                  onValueChange={(v) =>
                    setValue(
                      `streamers.${i}.settings.chat`,
                      v === "" ? undefined : (v as (typeof CHAT_MODES)[number]),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inherit from defaults" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-muted-foreground italic">Inherit from defaults</span>
                    </SelectItem>
                    {CHAT_MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(i)}
                disabled={!isAdmin && watch(`streamers.${i}.username`) === FORCED_STREAMER}
              >
                Remove
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
