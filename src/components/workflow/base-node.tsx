import type React from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { WorkflowNodeType, BaseNodeData } from "@/lib/workflow-types";
import { NODE_COLORS } from "@/lib/node-styles";
import { useWorkflowStore } from "@/store/workflow-store";
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
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Group,
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
  group: <Group size={16} />,
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
  const executionStatus = useWorkflowStore((s) => s.nodeExecutionStatus[id]);
  const executionResult = useWorkflowStore((s) => s.nodeExecutionResults[id]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const className = [
    'base-node',
    selected && 'base-node--selected',
    executionStatus === 'running' && 'base-node--running',
    executionStatus === 'success' && 'base-node--success',
    executionStatus === 'error' && 'base-node--error',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      style={{ borderColor: executionStatus === 'running' ? 'var(--execution-running)' : executionStatus === 'success' ? 'var(--execution-success)' : executionStatus === 'error' ? 'var(--execution-error)' : colors.borderColor }}
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
        {executionStatus === 'running' && (
          <Loader2 size={14} className="animate-spin base-node__status base-node__status--running" />
        )}
        {executionStatus === 'success' && (
          <CheckCircle2 size={14} className="base-node__status base-node__status--success" />
        )}
        {executionStatus === 'error' && (
          <AlertCircle size={14} className="base-node__status base-node__status--error" />
        )}
        {executionStatus === 'waiting' && (
          <Clock size={14} className="base-node__status base-node__status--waiting" />
        )}
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

      {executionResult && (
        <div className="base-node__execution-time">
          <Clock size={10} />
          <span>{executionResult.durationMs}ms</span>
        </div>
      )}

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
