"use client";

import { useFormContext } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "../shared/TagInput";

const PRIORITIES = [
  "STREAK",
  "DROPS",
  "ORDER",
  "SUBSCRIBED",
  "POINTS_ASCENDING",
  "POINTS_DESCENDING",
];

export function GeneralTab({ isAdmin }: { isAdmin: boolean }) {
  const {
    register,
    watch,
    setValue,
  } = useFormContext<AccountConfigForm>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Switch
          checked={watch("enabled") ?? true}
          onCheckedChange={(v) => setValue("enabled", v)}
        />
        <Label>Account enabled</Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Max watch streams</Label>
          <Input
            type="number"
            min={1}
            {...register("max_watch_streams", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1">
          <Label>Proxy (optional)</Label>
          <Input placeholder="socks5://127.0.0.1:1080" {...register("proxy")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Watch priority (ordered)</Label>
        <TagInput
          value={watch("priority")}
          onChange={(v) => setValue("priority", v as AccountConfigForm["priority"])}
          placeholder="Add priority…"
        />
        <p className="text-xs text-muted-foreground">
          Valid values: {PRIORITIES.join(", ")}
        </p>
      </div>

      <div className="space-y-3 rounded-md border p-4">
        <p className="font-medium text-sm">Features</p>
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("features.claim_drops_startup")}
            onCheckedChange={(v) => setValue("features.claim_drops_startup", v)}
          />
          <Label>Claim drops on startup</Label>
        </div>
        <div className={`flex items-center gap-3 ${!isAdmin ? "opacity-50 pointer-events-none" : ""}`}>
          <Switch
            checked={watch("features.enable_analytics")}
            onCheckedChange={(v) => setValue("features.enable_analytics", v)}
            disabled={!isAdmin}
          />
          <Label>
            Enable analytics
            {!isAdmin && <span className="ml-1.5 text-xs text-muted-foreground">(admin only)</span>}
          </Label>
        </div>
      </div>

      <div className="space-y-3 rounded-md border p-4">
        <p className="font-medium text-sm">Followers</p>
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("followers.enabled")}
            onCheckedChange={(v) => setValue("followers.enabled", v)}
          />
          <Label>Watch followed channels</Label>
        </div>
        <div className="space-y-1">
          <Label>Order</Label>
          <Select
            value={watch("followers.order")}
            onValueChange={(v) =>
              setValue("followers.order", v as "ASC" | "DESC")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">ASC</SelectItem>
              <SelectItem value="DESC">DESC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
