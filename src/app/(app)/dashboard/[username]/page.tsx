import { getBotAccount, listBotAccounts } from "@/actions/accounts";
import { ConfigEditor } from "@/components/config-editor/ConfigEditor";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ username: string }> };

export default async function ConfigEditorPage({ params }: Props) {
  const { username } = await params;
  try {
    const [{ config, isAdmin }, accounts] = await Promise.all([
      getBotAccount(username),
      listBotAccounts(),
    ]);
    const allAccounts = accounts.map((a) => a.username);
    return (
      <ConfigEditor
        initialConfig={config}
        isAdmin={isAdmin}
        allAccounts={allAccounts}
      />
    );
  } catch {
    notFound();
  }
}
