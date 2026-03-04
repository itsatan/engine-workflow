import { memo, useState, useCallback, useRef, useEffect } from "react";
import type { NodeProps } from "@xyflow/react";
import { NodeResizer, useReactFlow, useOnViewportChange } from "@xyflow/react";
import { X } from "lucide-react";
import type { GroupNodeData } from "@/lib/workflow-types";
import { useWorkflowStore } from "@/store/workflow-store";
import "./group-node.css";

function GroupNodeComponent({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as GroupNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { deleteElements, setNodes, getNodes } = useReactFlow();
  const updateNode = useWorkflowStore((s) => s.updateNode);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Keep zIndex low when selected (but not editing)
  // React Flow automatically raises zIndex when selecting, we need to override this
  useEffect(() => {
    if (!isEditing) {
      const allNodes = getNodes();
      const currentNode = allNodes.find((n) => n.id === id);
      // Only update if zIndex is not already -1
      if (currentNode && currentNode.zIndex !== -1) {
        setNodes(
          allNodes.map((n) =>
            n.id === id ? { ...n, zIndex: -1 } : n
          )
        );
      }
    }
  }, [selected, isEditing, id, getNodes, setNodes]);

  // Click outside to exit edit mode (using click event in capture phase)
  useEffect(() => {
    if (!isEditing) return;

    function handleClickOutside(e: MouseEvent) {
      // Check if click is outside the node
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setIsEditing(false);
        // Restore zIndex to default (lowest)
        const allNodes = getNodes();
        setNodes(
          allNodes.map((n) =>
            n.id === id ? { ...n, zIndex: -1 } : n
          )
        );
      }
    }

    // Use click event with capture phase to ensure we catch it before React Flow handles it
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isEditing, id, getNodes, setNodes]);

  // Exit edit mode when viewport changes (pan/zoom)
  useOnViewportChange({
    onChange: () => {
      if (isEditing) {
        setIsEditing(false);
        const allNodes = getNodes();
        setNodes(
          allNodes.map((n) =>
            n.id === id ? { ...n, zIndex: -1 } : n
          )
        );
      }
    },
  });

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteElements({ nodes: [{ id }] });
    },
    [id, deleteElements]
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNode(id, { ...data, content: e.target.value });
    },
    [id, data, updateNode]
  );

  // Double-click: enter edit mode and raise zIndex
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      const allNodes = getNodes();
      setNodes(
        allNodes.map((n) =>
          n.id === id ? { ...n, zIndex: 1000 } : n
        )
      );
    },
    [id, getNodes, setNodes]
  );

  return (
    <>
      <NodeResizer
        isVisible={selected && !isEditing}
        minWidth={200}
        minHeight={150}
        lineClassName="group-node__resize-line"
        handleClassName="group-node__resize-handle"
      />
      <div
        ref={nodeRef}
        className={`group-node${selected ? " group-node--selected" : ""}${isEditing ? " group-node--editing" : ""}`}
        onDoubleClick={handleDoubleClick}
      >
        {/* Header bar */}
        <div className="group-node__header">
          <span className="group-node__label">{data.label || "Group"}</span>
          <button
            type="button"
            onClick={handleDelete}
            className="group-node__delete"
            aria-label="Delete group"
          >
            <X size={14} />
          </button>
        </div>

        {/* Edit overlay - visible on double-click */}
        {isEditing && (
          <div className="group-node__edit-overlay">
            <textarea
              ref={textareaRef}
              value={data.content || ""}
              onChange={handleContentChange}
              className="group-node__textarea"
              placeholder="Type notes here..."
            />
          </div>
        )}

        {/* Content preview when not editing */}
        {!isEditing && data.content && (
          <div className="group-node__content-preview">
            {data.content}
          </div>
        )}
      </div>
    </>
  );
}

export const GroupNode = memo(GroupNodeComponent);
