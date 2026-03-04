import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { MemoryNodeData } from "@/lib/workflow-types";
import "./nodes.css";

function MemoryNodeComponent({ data, selected, ...props }: NodeProps<MemoryNodeData>) {
  return (
    <BaseNode nodeType="memory" data={data} selected={selected} {...props}>
      <div className="node-field">
        <input
          value={data.memoryKey}
          placeholder="Memory key (e.g., user_context)"
          className="node-input"
          readOnly
        />
        <div className="node-field-row">
          <div className="node-display text-capitalize">{data.operation}</div>
          <div className="node-display text-uppercase">{data.dataType}</div>
        </div>
        {data.operation === "read" && (
          <input
            value={data.defaultValue || ""}
            placeholder="Default value if not found"
            className="node-input"
            readOnly
          />
        )}
        <div className="node-accent-text" style={{ color: "var(--node-memory-accent)", opacity: 0.7 }}>
          {data.operation === "read" ? "Outputs stored value" : "Stores input to memory"}
        </div>
      </div>
    </BaseNode>
  );
}

export const MemoryNode = memo(MemoryNodeComponent);
