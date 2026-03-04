import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { MergeNodeData } from "@/lib/workflow-types";

function MergeNodeComponent({ data, selected, ...props }: NodeProps<MergeNodeData>) {
  return (
    <BaseNode nodeType="merge" data={data} selected={selected} hasInput={false} {...props}>
      <Handle
        type="target"
        position={Position.Left}
        id="input-1"
        style={{ top: "30%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-2"
        style={{ top: "70%" }}
      />
    </BaseNode>
  );
}

export const MergeNode = memo(MergeNodeComponent);
