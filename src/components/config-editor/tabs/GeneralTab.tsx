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
import { numRegister } from "../shared/form-helpers";

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
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Switch
          checked={watch("enabled") ?? true}
          onCheckedChange={(v) => setValue("enabled", v)}
        />
        <Label className="text-xs">Account enabled</Label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            Max watch streams
            {!isAdmin && <span className="ml-1.5 text-[10px] text-muted-foreground">(max 10)</span>}
          </Label>
          <Input
            type="number"
            min={1}
            {...(!isAdmin ? { max: 10 } : {})}
            {...register("max_watch_streams", numRegister())}
          />
        </div>
        <div className={`space-y-1.5 ${!isAdmin ? "opacity-50 pointer-events-none" : ""}`}>
          <Label>Proxy (optional)</Label>
          <Input
            placeholder="socks5://127.0.0.1:1080"
            disabled={!isAdmin}
            {...register("proxy")}
          />
          {!isAdmin && <p className="text-xs text-muted-foreground">(admin only)</p>}
        </div>
      </div>

      <div className="space-y-1.5">
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

      <div className="border border-border p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider">Features</p>
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("features.claim_drops_startup")}
            onCheckedChange={(v) => setValue("features.claim_drops_startup", v)}
          />
          <Label className="text-xs">Claim drops on startup</Label>
        </div>
        <div className={`flex items-center gap-3 ${!isAdmin ? "opacity-50 pointer-events-none" : ""}`}>
          <Switch
            checked={watch("features.enable_analytics")}
            onCheckedChange={(v) => setValue("features.enable_analytics", v)}
            disabled={!isAdmin}
          />
          <Label className="text-xs">
            Enable analytics
            {!isAdmin && <span className="ml-1.5 text-[10px] text-muted-foreground">(admin only)</span>}
          </Label>
        </div>
      </div>

      <div className="border border-border p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider">Followers</p>
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("followers.enabled")}
            onCheckedChange={(v) => setValue("followers.enabled", v)}
          />
          <Label className="text-xs">Watch followed channels</Label>
        </div>
        <div className="space-y-1.5">
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
