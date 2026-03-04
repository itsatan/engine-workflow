import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { OutputNodeData } from "@/lib/workflow-types";

function OutputNodeComponent({ data, selected, ...props }: NodeProps<OutputNodeData>) {
  return (
    <BaseNode nodeType="output" data={data} selected={selected} hasOutput={false} {...props} />
  );
}

export const OutputNode = memo(OutputNodeComponent);
