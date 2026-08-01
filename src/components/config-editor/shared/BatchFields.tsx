"use client";

import { useFormContext } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DurationInput } from "./DurationInput";
import { EventMultiSelect } from "./EventMultiSelect";
import { numRegister } from "./form-helpers";

type BatchPath =
  | "notifications.batch"
  | "notifications.telegram.batch"
  | "notifications.discord.batch"
  | "notifications.webhook.batch"
  | "notifications.matrix.batch"
  | "notifications.pushover.batch"
  | "notifications.gotify.batch";

type Props = {
  path: BatchPath;
};

export function BatchFields({ path }: Props) {
  const { register, watch, setValue } = useFormContext<AccountConfigForm>();
  const enabled = watch(`${path}.enabled`) ?? false;

  return (
    <div className="border border-border p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Switch
          checked={enabled}
          onCheckedChange={(v) => setValue(`${path}.enabled`, v)}
        />
        <Label className="text-xs">Batch notifications</Label>
      </div>
      <fieldset disabled={!enabled} className="space-y-3 disabled:opacity-50">
        <div className="space-y-1">
          <Label>Flush interval</Label>
          <DurationInput
            value={watch(`${path}.interval`) ?? "1m0s"}
            onChange={(v) => setValue(`${path}.interval`, v)}
            className="max-w-xs"
          />
        </div>
        <div className="space-y-1">
          <Label>Max entries per batch</Label>
          <Input
            type="number"
            min={1}
            {...register(`${path}.max_entries`, numRegister())}
          />
        </div>
        <div className="space-y-1">
          <Label>Immediate events</Label>
          <EventMultiSelect
            value={watch(`${path}.immediate_events`) ?? []}
            onChange={(v) =>
              setValue(
                `${path}.immediate_events`,
                v as NonNullable<AccountConfigForm["notifications"]["batch"]>["immediate_events"],
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            These events are sent immediately instead of being batched.
          </p>
        </div>
      </fieldset>
    </div>
  );
}
