"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tv2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Fields = z.infer<typeof schema>;

export default function LoginPage() {
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Fields) => {
    setError("");
    try {
      await signIn(data.email, data.password);
    } catch (e) {
      if (isRedirectError(e)) return;
      setError(e instanceof Error ? e.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="flex flex-col items-center gap-3 mb-10">
          <Tv2 className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Twitch Miner
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your bot accounts
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} placeholder="Enter your password" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
