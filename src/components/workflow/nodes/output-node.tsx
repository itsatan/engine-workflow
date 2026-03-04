import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { OutputNodeData } from "@/lib/workflow-types";
import { AGENT_TEMPLATES } from "@/lib/workflow-types";
import "./nodes.css";

function OutputNodeComponent({ data, selected, ...props }: NodeProps<OutputNodeData>) {
  return (
    <BaseNode nodeType="output" data={data} selected={selected} hasOutput={false} {...props}>
      <div className="node-field">
        <div className="node-display">
          {data.outputType === "github-wiki" ? "GitHub Wiki" :
           data.outputType === "agents-md" ? "agents.md" :
           data.outputType === "readme-md" ? "README.md" :
           data.outputType === "custom" ? "Custom Document" : "Select output type"}
        </div>

        {data.outputType === "agents-md" && (
          <div className="node-field">
            <div className="node-text-muted">Select Agent Type:</div>
            <div className="node-agent-grid">
              {Object.entries(AGENT_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  className={`node-agent-btn${data.agentType === key ? " node-agent-btn--active" : ""}`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {data.outputType === "custom" && (
          <>
            <input
              value={data.customFilename || ""}
              placeholder="Filename (e.g., my-doc.md)"
              className="node-input"
              readOnly
            />
            <textarea
              value={data.customTemplate || ""}
              placeholder="Custom template (use {{content}} for generated content)"
              className="node-textarea node-textarea--sm"
              readOnly
            />
          </>
        )}

        <div className="node-output-preview">
          <div className="node-output-preview-text">
            Output: {data.outputType === "agents-md" && data.agentType
              ? `${data.agentType}-agent.md`
              : data.outputType === "custom"
              ? data.customFilename || "output.md"
              : data.outputType ? `${data.outputType.replace("-", ".")}` : "output.md"}
          </div>
        </div>
      </div>
    </BaseNode>
  );
}

export const OutputNode = memo(OutputNodeComponent);
