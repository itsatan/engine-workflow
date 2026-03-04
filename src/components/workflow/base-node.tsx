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
  Copy,
  Settings,
} from "lucide-react";
import "./base-node.css";

const ICONS: Record<WorkflowNodeType, React.ReactNode> = {
  aiText: <Sparkles size={24} />,
  aiImage: <ImageIcon size={24} />,
  condition: <GitBranch size={24} />,
  memory: <Database size={24} />,
  github: <Github size={24} />,
  output: <FileOutput size={24} />,
  textInput: <Type size={24} />,
  merge: <Merge size={24} />,
  group: <Group size={24} />,
};

const NODE_NAMES: Record<WorkflowNodeType, string> = {
  aiText: "AI Text",
  aiImage: "AI Image",
  condition: "Condition",
  memory: "Memory",
  github: "GitHub",
  output: "Output",
  textInput: "Text Input",
  merge: "Merge",
  group: "Group",
};

interface BaseNodeComponentProps extends NodeProps {
  nodeType: WorkflowNodeType;
  children?: React.ReactNode;
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
  const nodeName = NODE_NAMES[nodeType];
  const { deleteElements, getNode } = useReactFlow();
  const executionStatus = useWorkflowStore((s) => s.nodeExecutionStatus[id]);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    const node = getNode(id);
    if (node) {
      setSelectedNode(node as any);
    }
  };

  // 根据执行状态确定边框颜色
  const getBorderColor = () => {
    if (executionStatus === 'running') return 'var(--execution-running)';
    if (executionStatus === 'success') return 'var(--execution-success)';
    if (executionStatus === 'error') return 'var(--execution-error)';
    return colors.borderColor;
  };

  // 根据执行状态确定图标颜色
  const getIconColor = () => {
    if (executionStatus === 'running') return 'var(--execution-running)';
    if (executionStatus === 'success') return 'var(--execution-success)';
    if (executionStatus === 'error') return 'var(--execution-error)';
    return colors.accentColor;
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
      style={{ borderColor: getBorderColor() }}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
        />
      )}

      {/* Status indicator */}
      {executionStatus === 'running' && (
        <Loader2 size={16} className="animate-spin base-node__status base-node__status--running" />
      )}
      {executionStatus === 'success' && (
        <CheckCircle2 size={16} className="base-node__status base-node__status--success" />
      )}
      {executionStatus === 'error' && (
        <AlertCircle size={16} className="base-node__status base-node__status--error" />
      )}
      {executionStatus === 'waiting' && (
        <Clock size={16} className="base-node__status base-node__status--waiting" />
      )}

      {/* Node Toolbar - 悬浮时显示 */}
      <div className="base-node__toolbar">
        <button
          type="button"
          onClick={handleDelete}
          className="base-node__toolbar-btn base-node__toolbar-btn--danger"
          aria-label="Delete node"
          title="删除节点"
        >
          <X size={12} />
        </button>
        <div className="base-node__toolbar-divider" />
        <button
          type="button"
          onClick={handleOpenSettings}
          className="base-node__toolbar-btn"
          aria-label="Settings"
          title="配置节点"
        >
          <Settings size={12} />
        </button>
      </div>

      {/* Icon */}
      <div className="base-node__icon-wrapper">
        <span className="base-node__icon" style={{ color: getIconColor() }}>
          {icon}
        </span>
      </div>

      {/* Node name below */}
      <span className="base-node__name">{(data as BaseNodeData).label || nodeName}</span>

      {/* Custom handles from children (e.g., merge node) */}
      {children}

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
            style={{ top: "35%" }}
            className="base-node__handle--true"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: "65%" }}
            className="base-node__handle--false"
          />
          <div className="base-node__handle-label base-node__handle-label--true">T</div>
          <div className="base-node__handle-label base-node__handle-label--false">F</div>
        </>
      )}
    </div>
  );
}
