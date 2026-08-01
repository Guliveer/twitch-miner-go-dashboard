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
import { numRegister } from "./form-helpers";
import {
  STRATEGIES,
  DELAY_MODES,
  OUTCOME_KEYS,
  CONDITIONS,
} from "@/lib/config-schema";

const STRATEGY_LABELS: Record<(typeof STRATEGIES)[number], string> = {
  SMART: "Smart",
  HIGH_ODDS: "High Odds",
  MOST_VOTED: "Most Voted",
  SMART_MONEY: "Smart Money",
  PERCENTAGE: "Percentage",
  NUMBER_1: "Number 1",
  NUMBER_2: "Number 2",
  NUMBER_3: "Number 3",
  NUMBER_4: "Number 4",
  NUMBER_5: "Number 5",
  NUMBER_6: "Number 6",
  NUMBER_7: "Number 7",
  NUMBER_8: "Number 8",
};
const DELAY_LABELS: Record<(typeof DELAY_MODES)[number], string> = {
  FROM_START: "From Start",
  FROM_END: "From End",
  PERCENTAGE: "Percentage",
};
const OUTCOME_LABELS: Record<(typeof OUTCOME_KEYS)[number], string> = {
  percentage_users: "Percentage Users",
  odds_percentage: "Odds Percentage",
  odds: "Odds",
  top_points: "Top Points",
  total_users: "Total Users",
  total_points: "Total Points",
  decision_users: "Decision Users",
  decision_points: "Decision Points",
};
const CONDITION_LABELS: Record<(typeof CONDITIONS)[number], string> = {
  GT: "Greater Than (>)",
  LT: "Less Than (<)",
  GTE: "Greater Than or Equal (≥)",
  LTE: "Less Than or Equal (≤)",
};

type BetPath =
  | "streamer_defaults.bet"
  | `streamers.${number}.settings.bet`;

type Props = {
  path: BetPath;
};

export function BetFields({ path }: Props) {
  const { register, watch, setValue } = useFormContext<AccountConfigForm>();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Strategy</Label>
          <Select
            value={watch(`${path}.strategy`) ?? "SMART"}
            onValueChange={(v) =>
              setValue(`${path}.strategy`, v as (typeof STRATEGIES)[number])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STRATEGIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STRATEGY_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Delay mode</Label>
          <Select
            value={watch(`${path}.delay_mode`) ?? "FROM_END"}
            onValueChange={(v) =>
              setValue(`${path}.delay_mode`, v as (typeof DELAY_MODES)[number])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELAY_MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {DELAY_LABELS[m]}
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
            {...register(`${path}.percentage`, numRegister())}
          />
        </div>
        <div className="space-y-1">
          <Label>Percentage gap</Label>
          <Input
            type="number"
            {...register(`${path}.percentage_gap`, numRegister())}
          />
        </div>
        <div className="space-y-1">
          <Label>Delay (seconds)</Label>
          <Input
            type="number"
            step="0.1"
            {...register(`${path}.delay`, numRegister())}
          />
        </div>
        <div className="space-y-1">
          <Label>Max points</Label>
          <Input
            type="number"
            {...register(`${path}.max_points`, numRegister())}
          />
        </div>
        <div className="space-y-1">
          <Label>Minimum points</Label>
          <Input
            type="number"
            {...register(`${path}.minimum_points`, numRegister())}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={watch(`${path}.stealth_mode`) ?? false}
          onCheckedChange={(v) => setValue(`${path}.stealth_mode`, v)}
        />
        <Label className="text-xs">Stealth mode</Label>
      </div>

      <div className="border border-border p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider">
          Filter condition
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>By</Label>
            <Select
              value={
                watch(`${path}.filter_condition.by`) ?? "total_users"
              }
              onValueChange={(v) =>
                setValue(
                  `${path}.filter_condition.by`,
                  v as (typeof OUTCOME_KEYS)[number],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTCOME_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {OUTCOME_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Where</Label>
            <Select
              value={
                watch(`${path}.filter_condition.where`) ?? "GTE"
              }
              onValueChange={(v) =>
                setValue(
                  `${path}.filter_condition.where`,
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
                    {CONDITION_LABELS[c]}
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
              {...register(`${path}.filter_condition.value`, numRegister(0))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
