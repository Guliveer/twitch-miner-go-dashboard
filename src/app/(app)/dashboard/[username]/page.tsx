import { getBotAccount } from "@/actions/accounts";
import { ConfigEditor } from "@/components/config-editor/ConfigEditor";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ username: string }> };

export default async function ConfigEditorPage({ params }: Props) {
  const { username } = await params;
  try {
    const { config, isAdmin } = await getBotAccount(username);
    return <ConfigEditor initialConfig={config} isAdmin={isAdmin} />;
  } catch {
    notFound();
  }
}
