"use client";

import { useFormContext } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { EventMultiSelect } from "../shared/EventMultiSelect";
import { BatchFields } from "../shared/BatchFields";

export function NotificationsTab() {
  const { register, watch, setValue } = useFormContext<AccountConfigForm>();

  return (
    <div className="space-y-4">
      <BatchFields path="notifications.batch" />
      <Accordion multiple className="space-y-2">
      {/* Telegram */}
      <AccordionItem value="telegram" className="border border-border px-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("notifications.telegram.enabled") ?? false}
            onCheckedChange={(v) =>
              setValue("notifications.telegram.enabled", v)
            }
            aria-label="Enable Telegram notifications"
          />
          <AccordionTrigger className="flex-1 items-center">
            <span>Telegram</span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Token</Label>
            <Input
              {...register("notifications.telegram.token")}
              placeholder="e.g. 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the TELEGRAM_TOKEN environment variable.
            </p>
          </div>
          <div className="space-y-1">
            <Label>Chat ID</Label>
            <Input
              {...register("notifications.telegram.chat_id")}
              placeholder="e.g. -1001234567890"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the TELEGRAM_CHAT_ID environment variable.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={
                watch("notifications.telegram.disable_notification") ?? false
              }
              onCheckedChange={(v) =>
                setValue("notifications.telegram.disable_notification", v)
              }
            />
            <Label>Disable notification sound</Label>
          </div>
          <div className="space-y-1">
            <Label>Events</Label>
            <EventMultiSelect
              value={watch("notifications.telegram.events") ?? []}
              onChange={(v) =>
                setValue(
                  "notifications.telegram.events",
                  v as NonNullable<AccountConfigForm["notifications"]["telegram"]>["events"],
                )
              }
            />
          </div>
          <BatchFields path="notifications.telegram.batch" />
        </AccordionContent>
      </AccordionItem>

      {/* Discord */}
      <AccordionItem value="discord" className="border border-border px-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("notifications.discord.enabled") ?? false}
            onCheckedChange={(v) =>
              setValue("notifications.discord.enabled", v)
            }
            aria-label="Enable Discord notifications"
          />
          <AccordionTrigger className="flex-1 items-center">
            <span>Discord</span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Webhook URL</Label>
            <Input
              {...register("notifications.discord.webhook_url")}
              placeholder="e.g. https://discord.com/api/webhooks/123456/ABC-xyz"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the DISCORD_WEBHOOK environment variable.
            </p>
          </div>
          <div className="space-y-1">
            <Label>Events</Label>
            <EventMultiSelect
              value={watch("notifications.discord.events") ?? []}
              onChange={(v) =>
                setValue(
                  "notifications.discord.events",
                  v as NonNullable<AccountConfigForm["notifications"]["discord"]>["events"],
                )
              }
            />
          </div>
          <BatchFields path="notifications.discord.batch" />
        </AccordionContent>
      </AccordionItem>

      {/* Webhook */}
      <AccordionItem value="webhook" className="border border-border px-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("notifications.webhook.enabled") ?? false}
            onCheckedChange={(v) =>
              setValue("notifications.webhook.enabled", v)
            }
            aria-label="Enable Webhook notifications"
          />
          <AccordionTrigger className="flex-1 items-center">
            <span>Webhook</span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Endpoint</Label>
            <Input
              {...register("notifications.webhook.endpoint")}
              placeholder="e.g. https://example.com/webhook"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the WEBHOOK_URL environment variable.
            </p>
          </div>
          <div className="space-y-1">
            <Label>Method</Label>
            <Select
              value={watch("notifications.webhook.method") ?? "POST"}
              onValueChange={(v) =>
                setValue(
                  "notifications.webhook.method",
                  v as "GET" | "POST",
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Events</Label>
            <EventMultiSelect
              value={watch("notifications.webhook.events") ?? []}
              onChange={(v) =>
                setValue(
                  "notifications.webhook.events",
                  v as NonNullable<AccountConfigForm["notifications"]["webhook"]>["events"],
                )
              }
            />
          </div>
          <BatchFields path="notifications.webhook.batch" />
        </AccordionContent>
      </AccordionItem>

      {/* Matrix */}
      <AccordionItem value="matrix" className="border border-border px-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("notifications.matrix.enabled") ?? false}
            onCheckedChange={(v) =>
              setValue("notifications.matrix.enabled", v)
            }
            aria-label="Enable Matrix notifications"
          />
          <AccordionTrigger className="flex-1 items-center">
            <span>Matrix</span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Homeserver</Label>
            <Input {...register("notifications.matrix.homeserver")} />
          </div>
          <div className="space-y-1">
            <Label>Room ID</Label>
            <Input {...register("notifications.matrix.room_id")} />
          </div>
          <div className="space-y-1">
            <Label>Access token</Label>
            <Input {...register("notifications.matrix.access_token")} />
          </div>
          <div className="space-y-1">
            <Label>Events</Label>
            <EventMultiSelect
              value={watch("notifications.matrix.events") ?? []}
              onChange={(v) =>
                setValue(
                  "notifications.matrix.events",
                  v as NonNullable<AccountConfigForm["notifications"]["matrix"]>["events"],
                )
              }
            />
          </div>
          <BatchFields path="notifications.matrix.batch" />
        </AccordionContent>
      </AccordionItem>

      {/* Pushover */}
      <AccordionItem value="pushover" className="border border-border px-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("notifications.pushover.enabled") ?? false}
            onCheckedChange={(v) =>
              setValue("notifications.pushover.enabled", v)
            }
            aria-label="Enable Pushover notifications"
          />
          <AccordionTrigger className="flex-1 items-center">
            <span>Pushover</span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>User key</Label>
            <Input {...register("notifications.pushover.user_key")} />
          </div>
          <div className="space-y-1">
            <Label>API token</Label>
            <Input {...register("notifications.pushover.api_token")} />
          </div>
          <div className="space-y-1">
            <Label>Events</Label>
            <EventMultiSelect
              value={watch("notifications.pushover.events") ?? []}
              onChange={(v) =>
                setValue(
                  "notifications.pushover.events",
                  v as NonNullable<AccountConfigForm["notifications"]["pushover"]>["events"],
                )
              }
            />
          </div>
          <BatchFields path="notifications.pushover.batch" />
        </AccordionContent>
      </AccordionItem>

      {/* Gotify */}
      <AccordionItem value="gotify" className="border border-border px-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={watch("notifications.gotify.enabled") ?? false}
            onCheckedChange={(v) =>
              setValue("notifications.gotify.enabled", v)
            }
            aria-label="Enable Gotify notifications"
          />
          <AccordionTrigger className="flex-1 items-center">
            <span>Gotify</span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>URL</Label>
            <Input {...register("notifications.gotify.url")} />
          </div>
          <div className="space-y-1">
            <Label>Token</Label>
            <Input {...register("notifications.gotify.token")} />
          </div>
          <div className="space-y-1">
            <Label>Events</Label>
            <EventMultiSelect
              value={watch("notifications.gotify.events") ?? []}
              onChange={(v) =>
                setValue(
                  "notifications.gotify.events",
                  v as NonNullable<AccountConfigForm["notifications"]["gotify"]>["events"],
                )
              }
            />
          </div>
          <BatchFields path="notifications.gotify.batch" />
        </AccordionContent>
      </AccordionItem>
      </Accordion>
    </div>
  );
}
