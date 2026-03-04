import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { TextInputNodeData } from "@/lib/workflow-types";
import "./nodes.css";

function TextInputNodeComponent({ data, selected, ...props }: NodeProps<TextInputNodeData>) {
  return (
    <BaseNode nodeType="textInput" data={data} selected={selected} hasInput={false} {...props}>
      <div className="node-field">
        <textarea
          value={data.text}
          placeholder="Enter text content here..."
          className="node-textarea node-textarea--lg"
          readOnly
        />
        <div className="node-text-muted">
          {data.text.length} characters
        </div>
      </div>
    </BaseNode>
  );
}

export const TextInputNode = memo(TextInputNodeComponent);
