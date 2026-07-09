"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DurationInput } from "../shared/DurationInput";
import { X } from "lucide-react";

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
              className="max-w-xs"
            />
          </div>
          <div className="space-y-1 pt-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={watch("category_watcher.drops_only") ?? false}
                onCheckedChange={(v) =>
                  setValue("category_watcher.drops_only", v)
                }
              />
              <Label>Drops only</Label>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              Only discover streams that have active Twitch Drops campaigns.
              Discovered streamers will also be set to drops-only mode. Each
              category can override this below.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Categories</Label>
          {catFields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-end">
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Slug</span>
                <Input
                  {...register(`category_watcher.categories.${i}.slug`)}
                  placeholder="just-chatting"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Drops only</span>
                <Select
                  value={
                    watch(`category_watcher.categories.${i}.drops_only`) ===
                    undefined
                      ? ""
                      : String(
                          watch(
                            `category_watcher.categories.${i}.drops_only`,
                          ),
                        )
                  }
                  onValueChange={(v) =>
                    setValue(
                      `category_watcher.categories.${i}.drops_only`,
                      v === "" ? undefined : v === "true",
                    )
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-[130px]">
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-muted-foreground italic">
                        Inherit
                      </span>
                    </SelectItem>
                    <SelectItem value="true">✓ On</SelectItem>
                    <SelectItem value="false">✗ Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-px"
                onClick={() => removeCat(i)}
              >
                <X className="h-4 w-4" />
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
            className="max-w-xs"
          />
        </div>
        <div className="space-y-2">
          <Label>Teams</Label>
          {teamFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`team_watcher.teams.${i}.name`)}
                placeholder="rainbow6"
                className="max-w-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTeam(i)}
              >
                <X className="h-4 w-4" />
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
