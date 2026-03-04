import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { ConditionNodeData } from "@/lib/workflow-types";

function ConditionNodeComponent({ data, selected, ...props }: NodeProps<ConditionNodeData>) {
  return (
    <BaseNode
      nodeType="condition"
      data={data}
      selected={selected}
      hasOutput={false}
      hasTrueOutput={true}
      {...props}
    />
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
