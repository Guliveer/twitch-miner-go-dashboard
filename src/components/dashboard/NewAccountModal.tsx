"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBotAccount } from "@/actions/accounts";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const schema = z.object({
  username: z.string().min(1).max(25).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
});

type Fields = z.infer<typeof schema>;

export function NewAccountModal() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Fields) => {
    setError("");
    startTransition(async () => {
      try {
        await createBotAccount(data.username);
        setOpen(false);
        reset();
      } catch (e) {
        if (isRedirectError(e)) return;
        setError(e instanceof Error ? e.message : "Failed to create account");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        New account
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add bot account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Twitch username</Label>
            <Input id="username" {...register("username")} placeholder="my_twitch_name" />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating…" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
