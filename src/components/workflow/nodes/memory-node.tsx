import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { MemoryNodeData } from "@/lib/workflow-types";

function MemoryNodeComponent({ data, selected, ...props }: NodeProps<MemoryNodeData>) {
  return (
    <BaseNode nodeType="memory" data={data} selected={selected} {...props} />
  );
}

export const MemoryNode = memo(MemoryNodeComponent);
