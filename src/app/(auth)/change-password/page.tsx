"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type Fields = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Fields) => {
    setError("");
    try {
      await changePassword(data.currentPassword, data.password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="flex flex-col items-center gap-3 mb-10">
          <KeyRound className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Set your password
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your temporary password and choose a new one.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current (temporary) password</Label>
            <Input id="currentPassword" type="password" {...register("currentPassword")} />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" {...register("confirm")} />
            {errors.confirm && (
              <p className="text-sm text-destructive">
                {errors.confirm.message}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Set password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
