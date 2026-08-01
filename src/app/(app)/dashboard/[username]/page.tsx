import { getBotAccount, listBotAccounts } from "@/actions/accounts";
import { ConfigEditor } from "@/components/config-editor/ConfigEditor";
import type { AccountConfigForm } from "@/lib/config-schema";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ username: string }> };

export default async function ConfigEditorPage({ params }: Props) {
  const { username } = await params;

  let config: AccountConfigForm;
  let isAdmin = false;
  let ownerDisplayName: string | undefined;
  let allAccounts: string[] = [];

  try {
    const [{ config: accountConfig, isAdmin: admin, ownerDisplayName: owner }, accounts] = await Promise.all([
      getBotAccount(username),
      listBotAccounts(),
    ]);
    config = accountConfig;
    isAdmin = admin;
    ownerDisplayName = owner;
    allAccounts = accounts.map((a) => a.username);
  } catch {
    notFound();
  }

  return (
    <ConfigEditor
      initialConfig={config}
      isAdmin={isAdmin}
      allAccounts={allAccounts}
      ownerDisplayName={ownerDisplayName}
    />
  );
}
