export type BotConfigSchema = {
  strategies: string[];
  chat_modes: string[];
  priorities: string[];
  followers_order: string[];
  delay_modes: string[];
  filter_where: string[];
  filter_by: string[];
  outcome_keys: string[];
  webhook_methods: string[];
  notification_events: string[];
  notification_providers: string[];
  defaults: Record<string, unknown>;
  rules: Array<{
    field: string;
    condition: string;
    target?: string;
    value?: string | number;
    min?: number;
    max?: number;
    message: string;
  }>;
};