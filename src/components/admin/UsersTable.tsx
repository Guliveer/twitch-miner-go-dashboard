"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resetUserPassword } from "@/actions/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  email: string;
  mustChangePassword: boolean;
  role: string;
};

export function UsersTable({ users }: { users: User[] }) {
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReset = (userId: string) => {
    startTransition(async () => {
      try {
        const pwd = await resetUserPassword(userId);
        setTempPassword(pwd);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Reset failed");
      }
    });
  };

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 pr-4">Email</th>
            <th className="pb-2 pr-4">Role</th>
            <th className="pb-2 pr-4">Must change password</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4">
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
              </td>
              <td className="py-2 pr-4">
                {u.mustChangePassword ? (
                  <Badge variant="destructive">Yes</Badge>
                ) : (
                  "No"
                )}
              </td>
              <td className="py-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleReset(u.id)}
                >
                  Reset password
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Share this with the user. It is shown only once.
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
