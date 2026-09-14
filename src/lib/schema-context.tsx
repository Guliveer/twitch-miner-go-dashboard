"use client";

import { createContext, useContext } from "react";
import type { BotConfigSchema } from "./schema-types";
import schemaFallback from "./schema-fallback.json";

const SchemaCtx = createContext<BotConfigSchema>(schemaFallback);

export const SchemaProvider = SchemaCtx.Provider;

/**
 * Returns the active config schema (bot-sourced or fallback).
 * Safe to call on every render — the provider fetches once on mount.
 */
export function useBotSchema(): BotConfigSchema {
  return useContext(SchemaCtx);
}