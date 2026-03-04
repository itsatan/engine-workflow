import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { MergeNodeData } from "@/lib/workflow-types";
import "./nodes.css";

function MergeNodeComponent({ data, selected, ...props }: NodeProps<MergeNodeData>) {
  return (
    <BaseNode nodeType="merge" data={data} selected={selected} hasInput={false} {...props}>
      <Handle
        type="target"
        position={Position.Left}
        id="input-1"
        style={{ top: "35%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-2"
        style={{ top: "65%" }}
      />

      <div className="node-field">
        <div className="node-text-muted">Merge multiple inputs with:</div>
        <div className="node-display" style={{ whiteSpace: "normal" }}>
          {data.separator === "\n\n" ? "Double newline" :
           data.separator === "\n" ? "Single newline" :
           data.separator === "\n---\n" ? "Horizontal rule" :
           data.separator === " " ? "Space" : "No separator"}
        </div>
        <div className="node-merge-labels">
          <span>Input 1</span>
          <span>Input 2</span>
        </div>
      </div>
    </BaseNode>
  );
}

export const MergeNode = memo(MergeNodeComponent);
