"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  accountConfigSchema,
  type AccountConfigForm,
} from "@/lib/config-schema";
import { updateBotAccount } from "@/actions/accounts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GeneralTab } from "./tabs/GeneralTab";
import { StreamersTab } from "./tabs/StreamersTab";
import { BettingTab } from "./tabs/BettingTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { WatchersTab } from "./tabs/WatchersTab";
import { useTransition } from "react";
import { toast } from "sonner";
import { exportConfigAsYaml } from "@/lib/export-yaml";

type Props = { initialConfig: AccountConfigForm; isAdmin: boolean };

export function ConfigEditor({ initialConfig, isAdmin }: Props) {
  const methods = useForm<AccountConfigForm>({
    resolver: zodResolver(accountConfigSchema),
    defaultValues: initialConfig,
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = methods.handleSubmit((data) => {
    startTransition(async () => {
      try {
        await updateBotAccount(data.username, data);
        toast.success("Configuration saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{initialConfig.username}</h1>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => exportConfigAsYaml(methods.getValues())}
            >
              Download YAML
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="streamers">Streamers</TabsTrigger>
            <TabsTrigger value="betting">Betting</TabsTrigger>
            {isAdmin && <TabsTrigger value="notifications">Notifications</TabsTrigger>}
            <TabsTrigger value="watchers">Watchers</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="streamers">
            <StreamersTab isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="betting">
            <BettingTab />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
          )}
          <TabsContent value="watchers">
            <WatchersTab />
          </TabsContent>
        </Tabs>
      </form>
    </FormProvider>
  );
}
