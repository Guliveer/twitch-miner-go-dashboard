"use client";

import { useForm, FormProvider } from "react-hook-form";
import { type ZodTypeAny } from "zod";
import {
  type AccountConfigForm,
  generalTabSchema,
  streamersTabSchema,
  bettingTabSchema,
  notificationsTabSchema,
  watchersTabSchema,
} from "@/lib/config-schema";
import { updateBotAccount } from "@/actions/accounts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, SlidersHorizontal, Users, TrendingUp,
  Bell, Eye, Download, KeyRound, Save,
} from "lucide-react";
import { GeneralTab } from "./tabs/GeneralTab";
import { StreamersTab } from "./tabs/StreamersTab";
import { BettingTab } from "./tabs/BettingTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { WatchersTab } from "./tabs/WatchersTab";
import { ConfigWarningsBanner } from "./shared/ConfigWarningsBanner";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { exportConfigAsYaml } from "@/lib/export-yaml";
import { useDeviceCode } from "@/hooks/useDeviceCode";
import { DeviceCodeModal } from "@/components/device-code-modal";

type Props = {
  initialConfig: AccountConfigForm;
  isAdmin: boolean;
  allAccounts: string[];
  ownerDisplayName?: string;
};

export function ConfigEditor({ initialConfig, isAdmin, allAccounts, ownerDisplayName }: Props) {
  const router = useRouter();
  const methods = useForm<AccountConfigForm>({
    defaultValues: initialConfig,
  });

  const [isPending, startTransition] = useTransition();
  const isDirty = methods.formState.isDirty;

  const TAB_SCHEMAS: Record<string, ZodTypeAny> = {
    general: generalTabSchema,
    streamers: streamersTabSchema,
    betting: bettingTabSchema,
    notifications: notificationsTabSchema,
    watchers: watchersTabSchema,
  };

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pendingCode = useDeviceCode(initialConfig.username);

  // Save confirmation dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Navigation confirmation when unsaved changes exist (account switch, links, unload)
  const [pendingNav, setPendingNav] = useState<{ path: string; label: string } | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      e.preventDefault();
      setPendingNav({ path: href, label: href });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  const handleSaveConfirmed = () => {
    setSaveDialogOpen(false);
    const data = methods.getValues();
    const issues: string[] = [];
    for (const [tab, schema] of Object.entries(TAB_SCHEMAS)) {
      const result = schema.safeParse(data);
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push(`[${tab}] ${issue.path.join(".") || "(root)"}: ${issue.message}`);
        }
      }
    }
    if (issues.length > 0) {
      toast.error(`Validation errors:\n${issues.join("\n")}`);
      return;
    }
    methods.handleSubmit((validated) => {
      const cleaned = {
        ...validated,
        streamers: validated.streamers.filter((s) => s.username.trim().length > 0),
      };
      const removedCount = validated.streamers.length - cleaned.streamers.length;
      startTransition(async () => {
        try {
          await updateBotAccount(cleaned.username, cleaned);
          toast.success("Configuration saved" + (removedCount > 0 ? ` (removed ${removedCount} unnamed streamer${removedCount > 1 ? "s" : ""})` : ""));
          methods.reset(cleaned);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Save failed");
        }
      });
    })();
  };

  const handleNavConfirmed = () => {
    if (!pendingNav) return;
    const path = pendingNav.path;
    setPendingNav(null);
    router.push(path);
  };

  const handleAccountChange = (value: string | null) => {
    if (!value || value === initialConfig.username) return;
    if (isDirty) {
      setPendingNav({ path: `/dashboard/${value}`, label: value });
    } else {
      router.push(`/dashboard/${value}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaveDialogOpen(true);
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            {allAccounts.length > 1 ? (
              <Select
                value={initialConfig.username}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger className="w-auto border-none bg-transparent shadow-none px-0 text-2xl font-bold tracking-tight h-auto focus:border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {[...allAccounts].sort((a, b) => a.localeCompare(b)).map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <h1 className="text-2xl font-bold tracking-tight truncate">{initialConfig.username}</h1>
            )}
            {ownerDisplayName && (
              <span className="text-xs text-muted-foreground">
                {ownerDisplayName}
              </span>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {pendingCode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setAuthModalOpen(true)}
              >
                <KeyRound className="h-4 w-4" />
                Authorize
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => exportConfigAsYaml(methods.getValues())}
            >
              <Download className="h-4 w-4" />
              Download YAML
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Saving…" : "Save changes"}
              {isDirty && !isPending && (
                <span className="ml-1 h-1.5 w-1.5 bg-accent" />
              )}
            </Button>
          </div>
        </div>

        <ConfigWarningsBanner />

        <Tabs defaultValue="general">
          <TabsList className="w-full border-b border-border">
            <TabsTrigger value="general">
              <SlidersHorizontal className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="streamers">
              <Users className="h-4 w-4" />
              Streamers
            </TabsTrigger>
            <TabsTrigger value="betting">
              <TrendingUp className="h-4 w-4" />
              Betting
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            )}
            <TabsTrigger value="watchers">
              <Eye className="h-4 w-4" />
              Watchers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general"><GeneralTab isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="streamers"><StreamersTab isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="betting"><BettingTab /></TabsContent>
          {isAdmin && (
            <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          )}
          <TabsContent value="watchers"><WatchersTab /></TabsContent>
        </Tabs>
      </form>

      {/* Save confirmation dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save configuration?</DialogTitle>
            <DialogDescription>
              This will overwrite the current configuration for{" "}
              <strong>{initialConfig.username}</strong> in the database. The bot
              will pick up the new config on next restart.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirmed} disabled={isPending}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved changes warning when navigating away */}
      <Dialog
        open={!!pendingNav}
        onOpenChange={(open) => { if (!open) setPendingNav(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes to <strong>{initialConfig.username}</strong>.
              Going to <strong>{pendingNav?.label}</strong> will discard them.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPendingNav(null)}>
              Stay here
            </Button>
            <Button variant="destructive" onClick={handleNavConfirmed}>
              Discard and continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Device code authorization modal */}
      {pendingCode && (
        <DeviceCodeModal
          username={initialConfig.username}
          code={pendingCode}
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
        />
      )}
    </FormProvider>
  );
}
