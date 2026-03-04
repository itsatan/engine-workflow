import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { ConditionNodeData } from "@/lib/workflow-types";
import "./nodes.css";

function ConditionNodeComponent({ data, selected, ...props }: NodeProps<ConditionNodeData>) {
  return (
    <BaseNode
      nodeType="condition"
      data={data}
      selected={selected}
      hasOutput={false}
      hasTrueOutput={true}
      {...props}
    >
      <div className="node-field">
        <input
          value={data.condition}
          placeholder="Variable to check (e.g., {{input}})"
          className="node-input"
          readOnly
        />
        <select value={data.operator} className="node-select">
          <option value="contains">contains</option>
          <option value="equals">equals</option>
          <option value="notEquals">not equals</option>
          <option value="greaterThan">greater than</option>
          <option value="lessThan">less than</option>
          <option value="isEmpty">is empty</option>
          <option value="isNotEmpty">is not empty</option>
        </select>
        {data.operator !== "isEmpty" && data.operator !== "isNotEmpty" && (
          <input
            value={data.value}
            placeholder="Comparison value"
            className="node-input"
            readOnly
          />
        )}
        <div className="node-paths">
          <span className="node-path--true">True path</span>
          <span className="node-path--false">False path</span>
        </div>
      </div>
    </BaseNode>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
