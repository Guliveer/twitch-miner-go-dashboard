import * as yaml from "js-yaml";
import type { AccountConfigForm } from "@/lib/config-schema";

type PlainObject = Record<string, unknown>;

function omitEmpty(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (value === "") return undefined;

  if (Array.isArray(value)) {
    return value.map(omitEmpty);
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

export function exportConfigAsYaml(config: AccountConfigForm): void {
  const { username, ...rest } = config;
  const cleaned = omitEmpty(rest) as PlainObject;

  const yamlString = yaml.dump(cleaned, {
    lineWidth: 120,
    noRefs: true,
  });

  const blob = new Blob([yamlString], { type: "text/yaml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${username}.yaml`;
  a.click();

  URL.revokeObjectURL(url);
}
