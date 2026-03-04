import type { WorkflowNodeType } from "./workflow-types";

export interface NodeColorStyle {
  borderColor: string;
  accentColor: string;
}

export const NODE_COLORS: Record<WorkflowNodeType, NodeColorStyle> = {
  aiText: {
    borderColor: "var(--node-ai-text-border)",
    accentColor: "var(--node-ai-text-accent)",
  },
  aiImage: {
    borderColor: "var(--node-ai-image-border)",
    accentColor: "var(--node-ai-image-accent)",
  },
  condition: {
    borderColor: "var(--node-condition-border)",
    accentColor: "var(--node-condition-accent)",
  },
  memory: {
    borderColor: "var(--node-memory-border)",
    accentColor: "var(--node-memory-accent)",
  },
  github: {
    borderColor: "var(--node-github-border)",
    accentColor: "var(--node-github-accent)",
  },
  output: {
    borderColor: "var(--node-output-border)",
    accentColor: "var(--node-output-accent)",
  },
  textInput: {
    borderColor: "var(--node-text-input-border)",
    accentColor: "var(--node-text-input-accent)",
  },
  merge: {
    borderColor: "var(--node-merge-border)",
    accentColor: "var(--node-merge-accent)",
  },
};
