"use client";

import { useFormContext } from "react-hook-form";
import type { AccountConfigForm } from "@/lib/config-schema";
import { getConfigWarnings } from "@/lib/config-warnings";
import { useBotSchema } from "@/lib/schema-context";
import { AlertTriangle } from "lucide-react";

export function ConfigWarningsBanner() {
  const { watch } = useFormContext<AccountConfigForm>();
  const schema = useBotSchema();
  const warnings = getConfigWarnings(watch(), schema.notification_providers);

  if (warnings.length === 0) return null;

  return (
    <div className="mb-4 border border-yellow-600/40 bg-yellow-600/10 p-3 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Config warnings
      </p>
      <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
        {warnings.map((w) => (
          <li key={w.id}>{w.message}</li>
        ))}
      </ul>
    </div>
  );
}
