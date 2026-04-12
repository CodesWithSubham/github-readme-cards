export type WorkflowConfig = {
  sections: string[];
  schedule: string;
  baseUrl: string;
  themeName?: string;
  locale?: string;
  readmeFile?: string;
};

export const CRON_PRESETS = [
  { label: "Every hour",   value: "0 * * * *"    },
  { label: "Every 2 hrs",  value: "0 */2 * * *"  },
  { label: "Every 6 hrs",  value: "0 */6 * * *"  },
  { label: "Every 12 hrs", value: "0 */12 * * *" },
  { label: "Daily",        value: "0 0 * * *"    },
  { label: "Weekly",       value: "0 0 * * 1"    },
] as const;
