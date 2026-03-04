import { useState } from "react";
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow-store";
import { EdgeAddNodePopover } from "./edge-add-node-popover";
import "./custom-edge.css";

export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [showPopover, setShowPopover] = useState(false);
  const edgeData = useWorkflowStore((s) => s.edgeExecutionData[id]);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeStroke = edgeData ? "var(--execution-success)" : "#52525b";

  return (
    <>
      {/* Visible edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: edgeStroke,
        }}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        {/* Execution time label */}
        {edgeData && !isExecuting && (
          <div
            className="custom-edge__time-label"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            {edgeData.durationMs}ms
          </div>
        )}

        {/* "+" button - visible when no execution data and not running */}
        {!edgeData && !isExecuting && (
          <div
            className="custom-edge__add-btn-wrapper"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            <button
              type="button"
              className="custom-edge__add-btn"
              onClick={() => setShowPopover(!showPopover)}
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Node type selector popover */}
        {showPopover && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, 0) translate(${labelX}px,${labelY + 20}px)`,
              pointerEvents: "all",
              zIndex: 100,
            }}
          >
            <EdgeAddNodePopover
              edgeId={id}
              onClose={() => {
                setShowPopover(false);
              }}
            />
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
