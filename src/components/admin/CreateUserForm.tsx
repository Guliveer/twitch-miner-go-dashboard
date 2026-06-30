"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

type Fields = z.infer<typeof schema>;

function resolveErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : "Failed to create user";
  // The createUser action creates the Neon Auth user before inserting user_meta.
  // If the DB insert fails after auth user creation, surface a hint so the admin
  // can clean up the orphaned auth account manually.
  if (raw.toLowerCase().includes("insert") || raw.toLowerCase().includes("unique") || raw.toLowerCase().includes("db")) {
    return `${raw} — the auth account may have been created. Check the Neon Auth console for an orphaned entry and remove it before retrying.`;
  }
  return raw;
}

export function CreateUserForm() {
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  const onSubmit = (data: Fields) => {
    setError("");
    startTransition(async () => {
      try {
        const pwd = await createUser(data.email, data.name);
        setTempPassword(pwd);
        reset();
      } catch (e) {
        setError(resolveErrorMessage(e));
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input {...register("name")} placeholder="Jan Kowalski" />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            {...register("email")}
            placeholder="user@example.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create user"}
        </Button>
      </form>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User created</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Share this temporary password. Shown once.
          </p>
          <code className="block bg-muted p-3 rounded font-mono text-lg select-all">
            {tempPassword}
          </code>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(tempPassword ?? "");
            }}
          >
            Copy
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
