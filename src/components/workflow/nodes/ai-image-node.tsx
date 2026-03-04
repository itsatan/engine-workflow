import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { AIImageNodeData } from "@/lib/workflow-types";
import "./nodes.css";

function AIImageNodeComponent({ data, selected, ...props }: NodeProps<AIImageNodeData>) {
  return (
    <BaseNode nodeType="aiImage" data={data} selected={selected} {...props}>
      <div className="node-field">
        <div className="node-field-row">
          <select value={data.provider} className="node-select" style={{ flex: 1 }}>
            <option value="google">Google Imagen</option>
          </select>
          <select value={data.size || "1024x1024"} className="node-select" style={{ flex: 1 }}>
            <option value="1024x1024">1024x1024</option>
            <option value="512x512">512x512</option>
            <option value="1792x1024">1792x1024</option>
          </select>
        </div>
        <textarea
          value={data.prompt}
          placeholder="Describe the image to generate..."
          className="node-textarea node-textarea--md"
          readOnly
        />
        <div className="node-image-placeholder">
          <span className="node-text-muted">Image preview will appear here</span>
        </div>
      </div>
    </BaseNode>
  );
}

export const AIImageNode = memo(AIImageNodeComponent);
