import { listBotAccounts } from "@/actions/accounts";
import { AccountsGrid } from "@/components/dashboard/AccountsGrid";
import { NewAccountModal } from "@/components/dashboard/NewAccountModal";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Bot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const [accounts, session] = await Promise.all([
    listBotAccounts(),
    getSession(),
  ]);

  const meta = session
    ? await db.query.userMeta.findFirst({ where: eq(userMeta.userId, session.user.id) })
    : null;
  const isAdmin = meta?.role === "admin";
  const atLimit = !isAdmin && accounts.length >= 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bot className="h-6 w-6" />
          Bot accounts
        </h1>
        {!atLimit && <NewAccountModal />}
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Bot className="h-12 w-12 text-muted-foreground/40" />
          <div className="space-y-1">
            <p className="font-medium">No bot accounts yet</p>
            <p className="text-sm text-muted-foreground">Add your first account to get started.</p>
          </div>
          <NewAccountModal />
        </div>
      ) : isAdmin ? (
        <AccountsGrid accounts={accounts} />
      ) : (
        /* Non-admin with 1 account — single card view, no search/filters needed */
        <div className="space-y-4">
          <AccountsGrid accounts={accounts} compact />
          {atLimit && (
            <div className="rounded-lg border border-dashed p-4 flex items-start gap-3 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                You've reached the 1-account limit for shared users.{" "}
                <Link
                  href="https://github.com/Guliveer/twitch-miner-go"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Run twitch-miner-go yourself
                </Link>{" "}
                to manage unlimited accounts without restrictions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
