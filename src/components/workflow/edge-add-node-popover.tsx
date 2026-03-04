import { useRef, useEffect } from "react";
import { NODE_DEFINITIONS } from "@/lib/node-definitions";
import { useWorkflowStore } from "@/store/workflow-store";
import type { WorkflowNodeType } from "@/lib/workflow-types";
import "./edge-add-node-popover.css";

interface EdgeAddNodePopoverProps {
  edgeId: string;
  onClose: () => void;
}

export function EdgeAddNodePopover({ edgeId, onClose }: EdgeAddNodePopoverProps) {
  const addNodeOnEdge = useWorkflowStore((s) => s.addNodeOnEdge);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSelect = (nodeType: WorkflowNodeType) => {
    addNodeOnEdge(edgeId, nodeType);
    onClose();
  };

  return (
    <div ref={ref} className="edge-popover">
      <div className="edge-popover__header">Add Node</div>
      <div className="edge-popover__list">
        {NODE_DEFINITIONS.map((node) => (
          <button
            key={node.type}
            type="button"
            className="edge-popover__item"
            onClick={() => handleSelect(node.type)}
          >
            <span className="edge-popover__item-icon">{node.icon}</span>
            <span className="edge-popover__item-name">{node.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
