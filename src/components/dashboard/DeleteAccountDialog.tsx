"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteBotAccount } from "@/actions/accounts";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Trash2 } from "lucide-react";

export function DeleteAccountDialog({ username }: { username: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="h-4 w-4" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {username}?</DialogTitle>
          <DialogDescription>
            This permanently removes the bot account and all its configuration. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              try { await deleteBotAccount(username); } catch (e) { if (!isRedirectError(e)) throw e; }
            })}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
