import { useRef, useEffect } from "react";
import type { WorkflowNodeType } from "@/lib/workflow-types";
import {
  Sparkles,
  ImageIcon,
  GitBranch,
  Database,
  Github,
  FileOutput,
  Type,
  Merge,
} from "lucide-react";
import "./dialogs.css";

const NODE_DEFINITIONS: {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "textInput",
    label: "Text Input",
    description: "Static text content",
    icon: <Type size={16} />,
  },
  {
    type: "github",
    label: "GitHub",
    description: "Fetch repository context",
    icon: <Github size={16} />,
  },
  {
    type: "memory",
    label: "Memory",
    description: "Persist/retrieve data",
    icon: <Database size={16} />,
  },
  {
    type: "aiText",
    label: "AI Text",
    description: "Generate text with AI",
    icon: <Sparkles size={16} />,
  },
  {
    type: "aiImage",
    label: "AI Image",
    description: "Generate images",
    icon: <ImageIcon size={16} />,
  },
  {
    type: "condition",
    label: "Condition",
    description: "Branch logic flow",
    icon: <GitBranch size={16} />,
  },
  {
    type: "merge",
    label: "Merge",
    description: "Combine multiple inputs",
    icon: <Merge size={16} />,
  },
  {
    type: "output",
    label: "Output",
    description: "Export to document",
    icon: <FileOutput size={16} />,
  },
];

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
