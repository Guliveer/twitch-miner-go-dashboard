"use client";

import { useFormContext } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BetFields } from "../shared/BetFields";

export function BettingTab() {
  const { watch, setValue } = useFormContext<AccountConfigForm>();
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
        <Label className="text-xs">Make predictions (default for all streamers)</Label>
      </div>

      <fieldset disabled={!makesPredictions} className="space-y-4 disabled:opacity-50">
        <BetFields path="streamer_defaults.bet" />
      </fieldset>
    </div>
  );
}
