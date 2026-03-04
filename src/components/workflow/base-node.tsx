import type React from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { WorkflowNodeType, BaseNodeData } from "@/lib/workflow-types";
import { NODE_COLORS } from "@/lib/node-styles";
import {
  Sparkles,
  ImageIcon,
  GitBranch,
  Database,
  Github,
  FileOutput,
  Type,
  Merge,
  X,
} from "lucide-react";
import "./base-node.css";

const ICONS: Record<WorkflowNodeType, React.ReactNode> = {
  aiText: <Sparkles size={16} />,
  aiImage: <ImageIcon size={16} />,
  condition: <GitBranch size={16} />,
  memory: <Database size={16} />,
  github: <Github size={16} />,
  output: <FileOutput size={16} />,
  textInput: <Type size={16} />,
  merge: <Merge size={16} />,
};

interface BaseNodeComponentProps extends NodeProps {
  nodeType: WorkflowNodeType;
  children: React.ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
  hasTrueOutput?: boolean;
  hasFalseOutput?: boolean;
  id: string;
}

export function BaseNode({
  nodeType,
  children,
  hasInput = true,
  hasOutput = true,
  hasTrueOutput = false,
  selected,
  data,
  id,
}: BaseNodeComponentProps) {
  const colors = NODE_COLORS[nodeType];
  const icon = ICONS[nodeType];
  const { deleteElements } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const className = `base-node${selected ? " base-node--selected" : ""}`;

  return (
    <div
      className={className}
      style={{ borderColor: colors.borderColor }}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
        />
      )}

      <div className="base-node__header">
        <span className="base-node__icon" style={{ color: colors.accentColor }}>
          {icon}
        </span>
        <span className="base-node__label">{(data as BaseNodeData).label}</span>
        <button
          type="button"
          onClick={handleDelete}
          className="base-node__delete"
          aria-label="Delete node"
        >
          <X size={14} />
        </button>
      </div>

      <div className="base-node__content">{children}</div>

      {hasOutput && !hasTrueOutput && (
        <Handle
          type="source"
          position={Position.Right}
        />
      )}

      {hasTrueOutput && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: "40%" }}
            className="base-node__handle--true"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: "70%" }}
            className="base-node__handle--false"
          />
          <div className="base-node__handle-label base-node__handle-label--true">true</div>
          <div className="base-node__handle-label base-node__handle-label--false">false</div>
        </>
      )}
    </div>
  );
}
