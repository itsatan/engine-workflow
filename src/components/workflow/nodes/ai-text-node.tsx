import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { AITextNodeData } from "@/lib/workflow-types";

function AITextNodeComponent({ data, selected, ...props }: NodeProps<AITextNodeData>) {
  return (
    <BaseNode nodeType="aiText" data={data} selected={selected} {...props} />
  );
}

export const AITextNode = memo(AITextNodeComponent);
