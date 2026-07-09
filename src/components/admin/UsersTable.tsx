"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resetUserPassword } from "@/actions/auth";
import { KeyRound, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  email: string;
  name: string | null;
  mustChangePassword: boolean;
  role: string;
};

export function UsersTable({ users }: { users: User[] }) {
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleReset = (userId: string) => {
    setPendingUserId(userId);
    startTransition(async () => {
      try {
        const pwd = await resetUserPassword(userId);
        setTempPassword(pwd);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Reset failed");
      } finally {
        setPendingUserId(null);
      }
    });
  };

  return (
    <>
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Must change password</th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-b-0">
                <td className="p-3 text-muted-foreground">
                  {u.name ?? <span className="italic text-muted-foreground">—</span>}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="p-3">
                  {u.mustChangePassword ? (
                    <Badge variant="destructive">Yes</Badge>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </td>
                <td className="p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pendingUserId === u.id}
                    onClick={() => handleReset(u.id)}
                  >
                    <KeyRound className="h-4 w-4" />
                    {pendingUserId === u.id ? "Resetting…" : "Reset password"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Share this with the user. It is shown only once.
          </p>
          <code className="block bg-muted p-3 font-mono text-lg select-all">
            {tempPassword}
          </code>
          <Button onClick={() => { navigator.clipboard.writeText(tempPassword ?? ""); }}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
