"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateDisplayName, changePasswordWithVerification } from "@/actions/auth";
import { toast } from "sonner";
import { Bot, Clock, RefreshCw } from "lucide-react";

type BotAccountRow = {
  username: string;
  enabled: boolean;
  updated_at: number;
  last_started_at: number | null;
};

function formatDate(epochSec: number): string {
  return new Date(epochSec * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

const nameSchema = z.object({ name: z.string().min(1, "Name is required") });
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type NameFields = z.infer<typeof nameSchema>;
type PasswordFields = z.infer<typeof passwordSchema>;

export function SettingsForm({ name, email, botAccounts = [], isAdmin }: { name: string; email: string; botAccounts?: BotAccountRow[]; isAdmin?: boolean }) {
  const [isPendingName, startNameTransition] = useTransition();
  const [isPendingPwd, startPwdTransition] = useTransition();

  const nameForm = useForm<NameFields>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name },
  });

  const pwdForm = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSaveName = (data: NameFields) => {
    startNameTransition(async () => {
      try {
        await updateDisplayName(data.name);
        toast.success("Display name updated");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed");
      }
    });
  };

  const onChangePassword = (data: PasswordFields) => {
    startPwdTransition(async () => {
      try {
        await changePasswordWithVerification(data.currentPassword, data.newPassword);
        toast.success("Password changed");
        pwdForm.reset();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed");
      }
    });
  };

  const initials = name
    ? name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    : email[0]?.toUpperCase() ?? "?";

  return (
    <div className="space-y-8">
      {/* Profile info */}
      <div className="flex items-center gap-4 pb-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-muted text-sm font-semibold select-none">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{email}</p>
        </div>
      </div>

      {!isAdmin && (
        <>
          <div className="relative flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="shrink-0 text-[10px] text-muted-foreground uppercase tracking-wider">Profile</span>
            <Separator className="flex-1" />
          </div>

          <div className="border border-border">
            <div className="border-b border-border p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider">Display name</h3>
            </div>
            <div className="p-5">
              <form onSubmit={nameForm.handleSubmit(onSaveName)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={email} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Display name</Label>
                  <Input {...nameForm.register("name")} />
                  {nameForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{nameForm.formState.errors.name.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isPendingName}>
                  {isPendingName ? "Saving…" : "Save"}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="shrink-0 text-[10px] text-muted-foreground uppercase tracking-wider">Security</span>
        <Separator className="flex-1" />
      </div>

      <div className="border border-border">
        <div className="border-b border-border p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Change password</h3>
        </div>
        <div className="p-5">
          <form onSubmit={pwdForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" {...pwdForm.register("currentPassword")} />
              {pwdForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{pwdForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" {...pwdForm.register("newPassword")} />
              {pwdForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{pwdForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm new password</Label>
              <Input type="password" {...pwdForm.register("confirmPassword")} />
              {pwdForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{pwdForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isPendingPwd}>
              {isPendingPwd ? "Changing…" : "Change password"}
            </Button>
          </form>
        </div>
      </div>

      {botAccounts.length > 0 && (
        <>
          <div className="relative flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="shrink-0 text-[10px] text-muted-foreground uppercase tracking-wider">Bot accounts</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-px border border-border">
            {botAccounts.map((a) => (
              <div key={a.username} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    {a.username}
                  </div>
                  <Badge variant={a.enabled ? "default" : "secondary"}>
                    {a.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-foreground/60">Last saved:</span>
                    <span>{formatDate(a.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-foreground/60">Last started:</span>
                    <span>
                      {a.last_started_at ? formatDate(a.last_started_at) : "Never"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
