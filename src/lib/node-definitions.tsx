import {
  Sparkles,
  ImageIcon,
  GitBranch,
  Database,
  Github,
  FileOutput,
  Type,
  Merge,
} from "lucide-react";
import type { WorkflowNodeType } from "./workflow-types";

export const NODE_DEFINITIONS: {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "textInput",
    label: "Text Input",
    description: "Static text content",
    icon: <Type size={16} />,
  },
  {
    type: "github",
    label: "GitHub",
    description: "Fetch repository context",
    icon: <Github size={16} />,
  },
  {
    type: "memory",
    label: "Memory",
    description: "Persist/retrieve data",
    icon: <Database size={16} />,
  },
  {
    type: "aiText",
    label: "AI Text",
    description: "Generate text with AI",
    icon: <Sparkles size={16} />,
  },
  {
    type: "aiImage",
    label: "AI Image",
    description: "Generate images",
    icon: <ImageIcon size={16} />,
  },
  {
    type: "condition",
    label: "Condition",
    description: "Branch logic flow",
    icon: <GitBranch size={16} />,
  },
  {
    type: "merge",
    label: "Merge",
    description: "Combine multiple inputs",
    icon: <Merge size={16} />,
  },
  {
    type: "output",
    label: "Output",
    description: "Export to document",
    icon: <FileOutput size={16} />,
  },
];
