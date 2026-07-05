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
import { numRegister } from "../shared/form-helpers";

const STRATEGIES = [
  "SMART",
  "HIGH_ODDS",
  "MOST_VOTED",
  "SMART_MONEY",
  "PERCENTAGE",
  "NUMBER_1",
  "NUMBER_2",
  "NUMBER_3",
  "NUMBER_4",
  "NUMBER_5",
  "NUMBER_6",
  "NUMBER_7",
  "NUMBER_8",
] as const;
const DELAY_MODES = ["FROM_START", "FROM_END", "PERCENTAGE"] as const;
const OUTCOME_KEYS = [
  "percentage_users",
  "odds_percentage",
  "odds",
  "top_points",
  "total_users",
  "total_points",
] as const;
const CONDITIONS = ["GT", "LT", "GTE", "LTE"] as const;

export function BettingTab() {
  const { register, watch, setValue } = useFormContext<AccountConfigForm>();
  const makesPredictions = watch("streamer_defaults.make_predictions") ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Switch
          checked={makesPredictions}
          onCheckedChange={(v) =>
            setValue("streamer_defaults.make_predictions", v)
          }
        />
        <Label>Make predictions (default for all streamers)</Label>
      </div>

      <fieldset disabled={!makesPredictions} className="space-y-4 disabled:opacity-50">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Strategy</Label>
            <Select
              value={watch("streamer_defaults.bet.strategy") ?? "SMART"}
              onValueChange={(v) =>
                setValue(
                  "streamer_defaults.bet.strategy",
                  v as (typeof STRATEGIES)[number],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STRATEGIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Delay mode</Label>
            <Select
              value={watch("streamer_defaults.bet.delay_mode") ?? "FROM_END"}
              onValueChange={(v) =>
                setValue(
                  "streamer_defaults.bet.delay_mode",
                  v as (typeof DELAY_MODES)[number],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Percentage</Label>
            <Input
              type="number"
              {...register("streamer_defaults.bet.percentage", numRegister())}
            />
          </div>
          <div className="space-y-1">
            <Label>Percentage gap</Label>
            <Input
              type="number"
              {...register("streamer_defaults.bet.percentage_gap", numRegister())}
            />
          </div>
          <div className="space-y-1">
            <Label>Delay (seconds)</Label>
            <Input
              type="number"
              step="0.1"
              {...register("streamer_defaults.bet.delay", numRegister())}
            />
          </div>
          <div className="space-y-1">
            <Label>Max points</Label>
            <Input
              type="number"
              {...register("streamer_defaults.bet.max_points", numRegister())}
            />
          </div>
          <div className="space-y-1">
            <Label>Minimum points</Label>
            <Input
              type="number"
              {...register("streamer_defaults.bet.minimum_points", numRegister())}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={watch("streamer_defaults.bet.stealth_mode") ?? false}
            onCheckedChange={(v) =>
              setValue("streamer_defaults.bet.stealth_mode", v)
            }
          />
          <Label>Stealth mode</Label>
        </div>

        <div className="space-y-3 rounded-md border p-4">
          <p className="text-sm font-medium">Filter condition</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>By</Label>
              <Select
                value={
                  watch("streamer_defaults.bet.filter_condition.by") ??
                  "total_users"
                }
                onValueChange={(v) =>
                  setValue(
                    "streamer_defaults.bet.filter_condition.by",
                    v as (typeof OUTCOME_KEYS)[number],
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOME_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Where</Label>
              <Select
                value={
                  watch("streamer_defaults.bet.filter_condition.where") ?? "GTE"
                }
                onValueChange={(v) =>
                  setValue(
                    "streamer_defaults.bet.filter_condition.where",
                    v as (typeof CONDITIONS)[number],
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Value</Label>
              <Input
                type="number"
                step="any"
                {...register("streamer_defaults.bet.filter_condition.value", numRegister(0))}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
