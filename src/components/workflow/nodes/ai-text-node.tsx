import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { AITextNodeData } from "@/lib/workflow-types";
import "./nodes.css";

function AITextNodeComponent({ data, selected, ...props }: NodeProps<AITextNodeData>) {
  return (
    <BaseNode nodeType="aiText" data={data} selected={selected} {...props}>
      <div className="node-field">
        <div className="node-field-row">
          <div className="node-display">{data.provider}</div>
          <div className="node-display">{data.model}</div>
        </div>
        <textarea
          value={data.systemPrompt || ""}
          placeholder="System prompt (optional)"
          className="node-textarea node-textarea--sm"
          readOnly
        />
        <textarea
          value={data.prompt}
          placeholder="Enter prompt... Use {{input}} for connected data"
          className="node-textarea node-textarea--md"
          readOnly
        />
        <div className="node-temp-row">
          <span className="node-text-muted">Temp:</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={data.temperature ?? 0.7}
            className="node-temp-range"
            readOnly
          />
          <span className="node-temp-value">{data.temperature ?? 0.7}</span>
        </div>
      </div>
    </BaseNode>
  );
}

export const AITextNode = memo(AITextNodeComponent);
