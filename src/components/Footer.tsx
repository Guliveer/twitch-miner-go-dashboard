import { DASHBOARD_VERSION, getBotStatus } from "@/lib/version";

export async function Footer() {
  const bot = await getBotStatus();

  return (
    <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground text-center">
      Account management dashboard for{" "}
      <a
        href="https://github.com/Guliveer/twitch-miner-go"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground transition-colors"
      >
        twitch-miner-go
      </a>
      {" · "}
      <span title="Dashboard version">v{DASHBOARD_VERSION}</span>
      {bot.version && (
        <>
          {" · "}
          <span
            className={
              bot.connected
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }
            title={bot.connected ? "Bot API reachable" : "Bot API not configured or unreachable"}
          >
            Bot v{bot.version}
          </span>
        </>
      )}
      {" · © 2026"}
    </footer>
  );
}
