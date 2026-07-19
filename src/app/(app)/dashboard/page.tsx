import { listBotAccounts } from "@/actions/accounts";
import { AccountsGrid } from "@/components/dashboard/AccountsGrid";
import { NewAccountModal } from "@/components/dashboard/NewAccountModal";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/server";
import { Bot, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [accounts, session] = await Promise.all([
    listBotAccounts(),
    getSession(),
  ]);

  let isAdmin = false;
  if (session) {
    const supabase = await createClient();
    const { data: meta } = await supabase
      .from("user_meta")
      .select("role")
      .eq("user_id", session.user.id)
      .single();
    isAdmin = meta?.role === "admin";
  }
  const atLimit = !isAdmin && accounts.length >= 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bot accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Manage all bot configurations" : "Manage your Twitch bot configurations"}
          </p>
        </div>
        {!atLimit && <NewAccountModal />}
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center border border-dashed border-border">
          <Bot className="h-10 w-10 text-muted-foreground/40" />
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">No bot accounts yet</p>
            <p className="text-sm text-muted-foreground">Add your first account to get started.</p>
          </div>
          <div className="mt-2">
            <NewAccountModal />
          </div>
        </div>
      ) : isAdmin ? (
        <AccountsGrid accounts={accounts} showOwnerSections isAdmin />
      ) : (
        <div className="space-y-4">
          <AccountsGrid accounts={accounts} compact />
          {atLimit && (
            <div className="border border-dashed border-border p-4 flex items-start gap-3 text-sm text-muted-foreground">
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
