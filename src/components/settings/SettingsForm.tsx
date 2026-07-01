"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateDisplayName, changePasswordWithVerification } from "@/actions/auth";
import { toast } from "sonner";

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

export function SettingsForm({ name, email }: { name: string; email: string }) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-semibold select-none">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{name || "—"}</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="shrink-0 text-xs text-muted-foreground uppercase tracking-wide">Profile</span>
        <Separator className="flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display name</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="shrink-0 text-xs text-muted-foreground uppercase tracking-wide">Security</span>
        <Separator className="flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
