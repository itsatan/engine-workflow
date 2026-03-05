import type React from "react";
import { useState } from "react";
import { Handle, Position, type NodeProps, useReactFlow, useStore } from "@xyflow/react";
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
  AlertTriangle,
  Clock,
  Group,
  Copy,
  Settings,
  Plus,
} from "lucide-react";
import { NodeAddPopover } from "./node-add-popover";
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
  const isExecuting = useWorkflowStore((s) => s.isExecuting);

  // 获取所有边
  const edges = useStore((state) => state.edges);

  // 检测右侧句柄是否有连接
  const hasRightConnection = edges.some(
    (edge) => edge.source === id && (edge.sourceHandle === undefined || edge.sourceHandle === null)
  );
  const hasTrueConnection = edges.some(
    (edge) => edge.source === id && edge.sourceHandle === "true"
  );
  const hasFalseConnection = edges.some(
    (edge) => edge.source === id && edge.sourceHandle === "false"
  );

  // 弹出框状态
  const [showPopover, setShowPopover] = useState(false);
  const [popoverHandle, setPopoverHandle] = useState<string | undefined>(undefined);

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
    if (executionStatus === 'warning') return 'var(--execution-warning)';
    if (executionStatus === 'error') return 'var(--execution-error)';
    return colors.borderColor;
  };

  // 根据执行状态确定图标颜色
  const getIconColor = () => {
    if (executionStatus === 'running') return 'var(--execution-running)';
    if (executionStatus === 'success') return 'var(--execution-success)';
    if (executionStatus === 'warning') return 'var(--execution-warning)';
    if (executionStatus === 'error') return 'var(--execution-error)';
    return colors.accentColor;
  };

  const className = [
    'base-node',
    selected && 'base-node--selected',
    executionStatus === 'running' && 'base-node--running',
    executionStatus === 'success' && 'base-node--success',
    executionStatus === 'warning' && 'base-node--warning',
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
      {executionStatus === 'warning' && (
        <AlertTriangle size={16} className="base-node__status base-node__status--warning" />
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

      {/* 普通输出句柄 - 右侧 */}
      {hasOutput && !hasTrueOutput && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            style={!hasRightConnection ? { opacity: 0, pointerEvents: 'none' } : undefined}
          />
          {!hasRightConnection && !isExecuting && (
            <div className="base-node__add-handle">
              <button
                type="button"
                className="base-node__add-btn"
                onClick={() => {
                  setPopoverHandle(undefined);
                  setShowPopover(!showPopover);
                }}
              >
                <Plus size={14} />
              </button>
              {showPopover && popoverHandle === undefined && (
                <NodeAddPopover
                  sourceNodeId={id}
                  onClose={() => setShowPopover(false)}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Condition 节点的 True/False 句柄 */}
      {hasTrueOutput && (
        <>
          {/* True 句柄 */}
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={!hasTrueConnection ? { top: "35%", opacity: 0, pointerEvents: 'none' } : { top: "35%" }}
            className="base-node__handle--true"
          />
          {!hasTrueConnection && !isExecuting && (
            <div className="base-node__add-handle base-node__add-handle--true">
              <button
                type="button"
                className="base-node__add-btn base-node__add-btn--true"
                onClick={() => {
                  setPopoverHandle("true");
                  setShowPopover(!showPopover || popoverHandle !== "true");
                }}
              >
                <Plus size={12} />
              </button>
              {showPopover && popoverHandle === "true" && (
                <NodeAddPopover
                  sourceNodeId={id}
                  sourceHandleId="true"
                  onClose={() => setShowPopover(false)}
                />
              )}
            </div>
          )}

          {/* False 句柄 */}
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={!hasFalseConnection ? { top: "65%", opacity: 0, pointerEvents: 'none' } : { top: "65%" }}
            className="base-node__handle--false"
          />
          {!hasFalseConnection && !isExecuting && (
            <div className="base-node__add-handle base-node__add-handle--false">
              <button
                type="button"
                className="base-node__add-btn base-node__add-btn--false"
                onClick={() => {
                  setPopoverHandle("false");
                  setShowPopover(!showPopover || popoverHandle !== "false");
                }}
              >
                <Plus size={12} />
              </button>
              {showPopover && popoverHandle === "false" && (
                <NodeAddPopover
                  sourceNodeId={id}
                  sourceHandleId="false"
                  onClose={() => setShowPopover(false)}
                />
              )}
            </div>
          )}
          <div className="base-node__handle-label base-node__handle-label--true">T</div>
          <div className="base-node__handle-label base-node__handle-label--false">F</div>
        </>
      )}
    </div>
  );
}
