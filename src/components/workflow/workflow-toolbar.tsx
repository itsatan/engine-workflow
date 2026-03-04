import { useState } from "react";
import {
  LayoutGrid,
  Trash2,
  Clock,
  Code2,
  Play,
  Loader2,
  Save,
  FolderOpen,
  Plus,
} from "lucide-react";
import { TemplatesDialog } from "./templates-dialog";
import { AddNodeDialog } from "./add-node-dialog";
import { useWorkflowStore } from "@/store/workflow-store";
import "./workflow-toolbar.css";

export function WorkflowToolbar() {
  const {
    workflowName,
    setWorkflowName,
    execute,
    save,
    setShowLoadDialog,
    handleClear,
    setShowHistoryDialog,
    showOutput,
    setShowOutput,
    selectTemplate,
    addNode,
    isExecuting,
    hasChanges,
  } = useWorkflowStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddNode, setShowAddNode] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    save();
    setTimeout(() => setIsSaving(false), 300);
  };

  return (
    <div className="workflow-toolbar">
      {/* Left: Logo and workflow name */}
      <div className="toolbar-left">
        <div className="toolbar-logo">
          <span className="toolbar-logo-text">FlowForge</span>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-name-group">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="toolbar-name-input"
            placeholder="Workflow name"
          />
          {hasChanges && (
            <span className="toolbar-unsaved-dot" title="Unsaved changes" />
          )}
        </div>
      </div>

      {/* Center: Action button groups */}
      <div className="toolbar-center">
        {/* Add Node */}
        <div className="toolbar-dropdown-wrapper">
          <div className="btn-group">
            <button
              type="button"
              className={`icon-btn${showAddNode ? " icon-btn--active" : ""}`}
              onClick={() => setShowAddNode(!showAddNode)}
              title="Add node"
            >
              <Plus size={16} />
            </button>
          </div>
          <AddNodeDialog
            isOpen={showAddNode}
            onClose={() => setShowAddNode(false)}
            onAddNode={(nodeType) => {
              addNode(nodeType);
              setShowAddNode(false);
            }}
          />
        </div>

        {/* Templates & Clear */}
        <div className="toolbar-dropdown-wrapper">
          <div className="btn-group">
            <button
              type="button"
              className={`icon-btn${showTemplates ? " icon-btn--active" : ""}`}
              onClick={() => setShowTemplates(!showTemplates)}
              title="Templates"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={handleClear}
              title="Clear canvas"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <TemplatesDialog
            isOpen={showTemplates}
            onClose={() => setShowTemplates(false)}
            onSelectTemplate={(nodes, edges, name) => {
              selectTemplate(nodes, edges, name);
              setShowTemplates(false);
            }}
          />
        </div>

        {/* Save & Load */}
        <div className="btn-group">
          <button
            type="button"
            className="icon-btn"
            onClick={handleSave}
            title="Save workflow"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowLoadDialog(true)}
            title="Load workflow"
          >
            <FolderOpen size={16} />
          </button>
        </div>

        {/* History */}
        <div className="btn-group">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowHistoryDialog(true)}
            title="Run history"
          >
            <Clock size={16} />
          </button>
        </div>

        {/* Output toggle */}
        <div className="btn-group">
          <button
            type="button"
            className={`icon-btn${showOutput ? " icon-btn--active" : ""}`}
            onClick={() => setShowOutput(!showOutput)}
            title="Toggle output panel"
          >
            <Code2 size={16} />
          </button>
        </div>

        {/* Run button */}
        <button
          type="button"
          onClick={execute}
          disabled={isExecuting}
          className="run-btn"
        >
          {isExecuting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {isExecuting ? "Running" : "Run"}
        </button>
      </div>

      {/* Right spacer for balance */}
      <div className="toolbar-right" />
    </div>
  );
}
