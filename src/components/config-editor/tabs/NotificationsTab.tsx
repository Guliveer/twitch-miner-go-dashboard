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

export function NotificationsTab() {
  const { register, watch, setValue } = useFormContext<AccountConfigForm>();

  return (
    <Accordion multiple className="space-y-2">
      {/* Telegram */}
      <AccordionItem value="telegram" className="border rounded-md px-3">
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            <Switch
              checked={watch("notifications.telegram.enabled") ?? false}
              onCheckedChange={(v) =>
                setValue("notifications.telegram.enabled", v)
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span>Telegram</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Token</Label>
            <Input
              {...register("notifications.telegram.token")}
              placeholder="from env: TELEGRAM_TOKEN"
            />
          </div>
          <div className="space-y-1">
            <Label>Chat ID</Label>
            <Input
              {...register("notifications.telegram.chat_id")}
              placeholder="from env: TELEGRAM_CHAT_ID"
            />
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
        </AccordionContent>
      </AccordionItem>

      {/* Discord */}
      <AccordionItem value="discord" className="border rounded-md px-3">
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            <Switch
              checked={watch("notifications.discord.enabled") ?? false}
              onCheckedChange={(v) =>
                setValue("notifications.discord.enabled", v)
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span>Discord</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Webhook URL</Label>
            <Input
              {...register("notifications.discord.webhook_url")}
              placeholder="from env: DISCORD_WEBHOOK"
            />
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
        </AccordionContent>
      </AccordionItem>

      {/* Webhook */}
      <AccordionItem value="webhook" className="border rounded-md px-3">
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            <Switch
              checked={watch("notifications.webhook.enabled") ?? false}
              onCheckedChange={(v) =>
                setValue("notifications.webhook.enabled", v)
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span>Webhook</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label>Endpoint</Label>
            <Input
              {...register("notifications.webhook.endpoint")}
              placeholder="from env: WEBHOOK_URL"
            />
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
        </AccordionContent>
      </AccordionItem>

      {/* Matrix */}
      <AccordionItem value="matrix" className="border rounded-md px-3">
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            <Switch
              checked={watch("notifications.matrix.enabled") ?? false}
              onCheckedChange={(v) =>
                setValue("notifications.matrix.enabled", v)
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span>Matrix</span>
          </div>
        </AccordionTrigger>
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
        </AccordionContent>
      </AccordionItem>

      {/* Pushover */}
      <AccordionItem value="pushover" className="border rounded-md px-3">
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            <Switch
              checked={watch("notifications.pushover.enabled") ?? false}
              onCheckedChange={(v) =>
                setValue("notifications.pushover.enabled", v)
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span>Pushover</span>
          </div>
        </AccordionTrigger>
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
        </AccordionContent>
      </AccordionItem>

      {/* Gotify */}
      <AccordionItem value="gotify" className="border rounded-md px-3">
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            <Switch
              checked={watch("notifications.gotify.enabled") ?? false}
              onCheckedChange={(v) =>
                setValue("notifications.gotify.enabled", v)
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span>Gotify</span>
          </div>
        </AccordionTrigger>
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
