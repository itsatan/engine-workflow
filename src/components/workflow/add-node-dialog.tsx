import { useRef, useEffect } from "react";
import type { WorkflowNodeType } from "@/lib/workflow-types";
import { NODE_DEFINITIONS } from "@/lib/node-definitions";
import "./dialogs.css";

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (nodeType: WorkflowNodeType) => void;
}

export function AddNodeDialog({ isOpen, onClose, onAddNode }: AddNodeDialogProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="dropdown-menu">
      <div className="dropdown-menu__header">
        <span className="dropdown-menu__title">Add Node</span>
      </div>

      <div className="dropdown-menu__list">
        {NODE_DEFINITIONS.map((node) => (
          <button
            key={node.type}
            type="button"
            onClick={() => {
              onAddNode(node.type);
              onClose();
            }}
            className="dropdown-menu__item"
          >
            <div className="dropdown-menu__item-icon">{node.icon}</div>
            <div className="dropdown-menu__item-info">
              <div className="dropdown-menu__item-name">
                {node.label}
              </div>
              <div className="dropdown-menu__item-desc">{node.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
