import { useState, useRef, useCallback } from "react";
import {
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow-store";
import "./custom-edge.css";

export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const edgeData = useWorkflowStore((s) => s.edgeExecutionData[id]);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);
  const { deleteElements } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeStroke = edgeData
    ? edgeData.status === 'error'
      ? "var(--execution-error)"
      : edgeData.status === 'warning'
        ? "var(--execution-warning)"
        : "var(--execution-success)"
    : "#52525b";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ edges: [{ id }] });
  };

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  }, []);

  return (
    <>
      {/* 透明触发区域 - 扩大悬浮检测范围 */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={60}
        stroke="transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "pointer" }}
      />

      {/* Visible edge - 直接渲染 path 以完全控制颜色 */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        strokeWidth={2}
        stroke={edgeStroke}
        markerEnd={markerEnd}
        style={{ pointerEvents: "none" }}
        className="react-flow__edge-path"
      />

      <EdgeLabelRenderer>
        {/* Execution time label - 显示边数据后立即显示 */}
        {edgeData && (
          <div
            className="custom-edge__time-label"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              color: edgeStroke,
            }}
          >
            {edgeData.durationMs}ms
          </div>
        )}

        {/* 悬浮删除按钮 */}
        {isHovered && !isExecuting && !edgeData && (
          <div
            className="custom-edge__delete-btn-wrapper"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="custom-edge__delete-btn"
              onClick={handleDelete}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
