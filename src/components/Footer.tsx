export function Footer() {
  return (
    <footer className="border-t px-6 py-3 text-xs text-muted-foreground text-center">
      Account management dashboard for{" "}
      <a
        href="https://github.com/Guliveer/twitch-miner-go"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground transition-colors"
      >
        twitch-miner-go
      </a>
    </footer>
  );
}
