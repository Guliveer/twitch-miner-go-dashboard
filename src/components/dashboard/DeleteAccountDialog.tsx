"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteBotAccount } from "@/actions/accounts";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteAccountDialog({ username, disabled }: { username: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" disabled={disabled} />}>
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {username}?</DialogTitle>
          <DialogDescription>
            This permanently removes the bot account and all its configuration. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <DialogTrigger render={<Button variant="outline" />}>Cancel</DialogTrigger>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              try {
                await deleteBotAccount(username);
                setOpen(false);
              } catch (e) {
                if (isRedirectError(e)) return;
                toast.error(e instanceof Error ? e.message : "Failed to delete account");
              }
            })}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
