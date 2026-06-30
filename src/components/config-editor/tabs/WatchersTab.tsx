"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DurationInput } from "../shared/DurationInput";

export function WatchersTab() {
  const { register, watch, setValue, control } =
    useFormContext<AccountConfigForm>();
  const {
    fields: catFields,
    append: appendCat,
    remove: removeCat,
  } = useFieldArray({ control, name: "category_watcher.categories" });
  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({ control, name: "team_watcher.teams" });

  return (
    <div className="space-y-8">
      {/* Category Watcher */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("category_watcher.enabled") ?? false}
            onCheckedChange={(v) => setValue("category_watcher.enabled", v)}
          />
          <p className="font-medium">Category Watcher</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Poll interval</Label>
            <DurationInput
              value={watch("category_watcher.poll_interval") ?? "2m0s"}
              onChange={(v) => setValue("category_watcher.poll_interval", v)}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              checked={watch("category_watcher.drops_only") ?? false}
              onCheckedChange={(v) =>
                setValue("category_watcher.drops_only", v)
              }
            />
            <Label>Drops only</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Categories</Label>
          {catFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`category_watcher.categories.${i}.slug`)}
                placeholder="just-chatting"
              />
              <div className="flex items-center gap-2 min-w-fit">
                <Switch
                  checked={
                    watch(`category_watcher.categories.${i}.drops_only`) ??
                    false
                  }
                  onCheckedChange={(v) =>
                    setValue(
                      `category_watcher.categories.${i}.drops_only`,
                      v,
                    )
                  }
                />
                <Label className="text-xs whitespace-nowrap">drops only</Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCat(i)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCat({ slug: "" })}
          >
            Add category
          </Button>
        </div>
      </div>

      <Separator />

      {/* Team Watcher */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("team_watcher.enabled")}
            onCheckedChange={(v) => setValue("team_watcher.enabled", v)}
          />
          <p className="font-medium">Team Watcher</p>
        </div>
        <div className="space-y-1">
          <Label>Poll interval</Label>
          <DurationInput
            value={watch("team_watcher.poll_interval") ?? "2m0s"}
            onChange={(v) => setValue("team_watcher.poll_interval", v)}
          />
        </div>
        <div className="space-y-2">
          <Label>Teams</Label>
          {teamFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`team_watcher.teams.${i}.name`)}
                placeholder="rainbow6"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTeam(i)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendTeam({ name: "" })}
          >
            Add team
          </Button>
        </div>
      </div>
    </div>
  );
}
