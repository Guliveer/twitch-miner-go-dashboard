import * as yaml from "js-yaml";
import type { AccountConfigForm } from "@/lib/config-schema";
import { generateConfigYaml } from "@/actions/bot-config";

type PlainObject = Record<string, unknown>;

function omitEmpty(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (value === "") return undefined;

  if (Array.isArray(value)) {
    const mapped = value.map(omitEmpty).filter((v) => v !== undefined);
    return mapped.length > 0 ? mapped : undefined;
  }

  if (typeof value === "object") {
    const result: PlainObject = {};
    for (const [k, v] of Object.entries(value as PlainObject)) {
      const cleaned = omitEmpty(v);
      if (cleaned !== undefined) {
        result[k] = cleaned;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  return value;
}

function generateClientSide(config: AccountConfigForm): { yaml: string; filename: string } {
  const { username, ...rest } = config;
  const cleaned = omitEmpty(rest) as PlainObject;

  const yamlString = yaml.dump(cleaned, {
    lineWidth: 120,
    noRefs: true,
  });

  return { yaml: yamlString, filename: `${username}.yaml` };
}

function triggerDownload(yamlString: string, filename: string): void {
  const blob = new Blob([yamlString], { type: "text/yaml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export async function exportConfigAsYaml(config: AccountConfigForm): Promise<void> {
  const result = await generateConfigYaml(config);

  if (result) {
    triggerDownload(result.yaml, result.filename);
  } else {
    const fallback = generateClientSide(config);
    triggerDownload(fallback.yaml, fallback.filename);
  }
}
