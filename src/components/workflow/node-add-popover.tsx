import { useRef, useEffect } from "react";
import { NODE_DEFINITIONS } from "@/lib/node-definitions";
import { useWorkflowStore } from "@/store/workflow-store";
import type { WorkflowNodeType } from "@/lib/workflow-types";
import "./node-add-popover.css";

interface NodeAddPopoverProps {
  sourceNodeId: string;
  sourceHandleId?: string;
  onClose: () => void;
}

export function NodeAddPopover({ sourceNodeId, sourceHandleId, onClose }: NodeAddPopoverProps) {
  const addNodeAfterNode = useWorkflowStore((s) => s.addNodeAfterNode);
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
    addNodeAfterNode(sourceNodeId, nodeType, sourceHandleId);
    onClose();
  };

  return (
    <div ref={ref} className="node-popover">
      <div className="node-popover__header">Add Node</div>
      <div className="node-popover__list">
        {NODE_DEFINITIONS.filter((node) => node.type !== "group").map((node) => (
          <button
            key={node.type}
            type="button"
            className="node-popover__item"
            onClick={() => handleSelect(node.type)}
          >
            <span className="node-popover__item-icon">{node.icon}</span>
            <span className="node-popover__item-name">{node.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
