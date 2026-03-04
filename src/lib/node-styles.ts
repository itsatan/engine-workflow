import type { WorkflowNodeType } from "./workflow-types";

export interface NodeColorStyle {
  borderColor: string;
  accentColor: string;
}

// 所有节点默认使用统一的灰色样式
const DEFAULT_STYLE: NodeColorStyle = {
  borderColor: "var(--node-default-border)",
  accentColor: "var(--node-default-accent)",
};

export const NODE_COLORS: Record<WorkflowNodeType, NodeColorStyle> = {
  aiText: DEFAULT_STYLE,
  aiImage: DEFAULT_STYLE,
  condition: DEFAULT_STYLE,
  memory: DEFAULT_STYLE,
  github: DEFAULT_STYLE,
  output: DEFAULT_STYLE,
  textInput: DEFAULT_STYLE,
  merge: DEFAULT_STYLE,
  group: DEFAULT_STYLE,
};
