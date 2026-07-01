"use client";

import { useForm, FormProvider } from "react-hook-form";
import { type AccountConfigForm } from "@/lib/config-schema";
import { updateBotAccount } from "@/actions/accounts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { cn } from "@/lib/utils";
import {
  ArrowLeft, SlidersHorizontal, Users, TrendingUp,
  Bell, Eye, Download, Save,
} from "lucide-react";
import { GeneralTab } from "./tabs/GeneralTab";
import { StreamersTab } from "./tabs/StreamersTab";
import { BettingTab } from "./tabs/BettingTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { WatchersTab } from "./tabs/WatchersTab";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { exportConfigAsYaml } from "@/lib/export-yaml";

type Props = {
  initialConfig: AccountConfigForm;
  isAdmin: boolean;
  allAccounts: string[];
};

export function ConfigEditor({ initialConfig, isAdmin, allAccounts }: Props) {
  const router = useRouter();
  const methods = useForm<AccountConfigForm>({
    defaultValues: initialConfig,
  });

  const [isPending, startTransition] = useTransition();
  const isDirty = methods.formState.isDirty;

  // Save confirmation dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Account switch confirmation dialog
  const [switchTarget, setSwitchTarget] = useState<string | null>(null);

  const handleSaveConfirmed = () => {
    setSaveDialogOpen(false);
    methods.handleSubmit((data) => {
      startTransition(async () => {
        try {
          await updateBotAccount(data.username, data);
          toast.success("Configuration saved");
          methods.reset(data);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Save failed");
        }
      });
    })();
  };

  const handleSwitchConfirmed = () => {
    if (!switchTarget) return;
    setSwitchTarget(null);
    router.push(`/dashboard/${switchTarget}`);
  };

  const handleAccountChange = (value: string | null) => {
    if (!value || value === initialConfig.username) return;
    if (isDirty) {
      setSwitchTarget(value);
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
        className="space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            {allAccounts.length > 1 ? (
              <Select
                value={initialConfig.username}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger className="w-auto border-none bg-transparent shadow-none px-1 text-2xl font-bold h-auto focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {[...allAccounts].sort((a, b) => a.localeCompare(b)).map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <h1 className="text-2xl font-bold truncate">{initialConfig.username}</h1>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
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
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="w-full overflow-x-auto">
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
          <TabsContent value="general"><GeneralTab /></TabsContent>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirmed} disabled={isPending}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved changes warning when switching accounts */}
      <Dialog
        open={!!switchTarget}
        onOpenChange={(open) => { if (!open) setSwitchTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes to <strong>{initialConfig.username}</strong>.
              Switching to <strong>{switchTarget}</strong> will discard them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSwitchTarget(null)}>
              Stay here
            </Button>
            <Button variant="destructive" onClick={handleSwitchConfirmed}>
              Discard and switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
