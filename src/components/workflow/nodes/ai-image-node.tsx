import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { AIImageNodeData } from "@/lib/workflow-types";

function AIImageNodeComponent({ data, selected, ...props }: NodeProps<AIImageNodeData>) {
  return (
    <BaseNode nodeType="aiImage" data={data} selected={selected} {...props} />
  );
}

export const AIImageNode = memo(AIImageNodeComponent);
