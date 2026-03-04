import { memo, useState, useCallback, useRef, useEffect } from "react";
import type { NodeProps } from "@xyflow/react";
import { NodeResizer, useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
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

  // Keep zIndex low always (only raise on double-click edit)
  useEffect(() => {
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
  }, [selected, id, getNodes, setNodes]);

  // Click outside to exit edit mode (using click event in capture phase)
  useEffect(() => {
    if (!isEditing) return;

    function handleClickOutside(e: MouseEvent) {
      // Check if click is outside the node
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        exitEditMode();
      }
    }

    // Use click event with capture phase to ensure we catch it before React Flow handles it
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isEditing, id, getNodes, setNodes]);

  // Exit edit mode helper
  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    const allNodes = getNodes();
    setNodes(
      allNodes.map((n) =>
        n.id === id ? { ...n, zIndex: -1, draggable: true } : n
      )
    );
  }, [id, getNodes, setNodes]);

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

  // Double-click: enter edit mode and raise zIndex, disable dragging
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsEditing(true);
      const allNodes = getNodes();
      setNodes(
        allNodes.map((n) =>
          n.id === id ? { ...n, zIndex: 1000, draggable: false } : n
        )
      );
    },
    [id, getNodes, setNodes]
  );

  // Prevent drag when in edit mode
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) {
        e.stopPropagation();
      }
    },
    [isEditing]
  );

  // Prevent all mouse/pointer events from bubbling when in edit mode
  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

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
        onMouseDown={handleMouseDown}
      >
        {/* Header bar */}
        <div className="group-node__header">
          <span className="group-node__label">{data.label || "Group"}</span>
          <div className="group-node__header-spacer" />
          <button
            type="button"
            onClick={handleDelete}
            className="group-node__delete"
            aria-label="Delete group"
          >
            <X size={16} />
          </button>
        </div>

        {/* Edit overlay - visible on double-click */}
        {isEditing && (
          <div
            className="group-node__edit-overlay nodrag nowheel nopan"
            onMouseDown={stopPropagation}
            onPointerDown={stopPropagation}
          >
            <textarea
              ref={textareaRef}
              value={data.content || ""}
              onChange={handleContentChange}
              className="group-node__textarea nodrag nowheel nopan"
              placeholder="Type notes here... (Markdown supported)"
              onMouseDown={stopPropagation}
              onPointerDown={stopPropagation}
            />
          </div>
        )}

        {/* Content preview when not editing - render as Markdown */}
        {!isEditing && data.content && (
          <div className="group-node__content-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {data.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
}

export const GroupNode = memo(GroupNodeComponent);
