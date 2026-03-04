import { ReactFlowProvider } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflow-store";
import { WorkflowCanvas } from "./workflow-canvas";
import { WorkflowToolbar } from "./workflow-toolbar";
import { OutputPanel } from "./output-panel";
import { NodeEditPanel } from "./node-edit-panel";
import { LoadWorkflowDialog } from "./load-workflow-dialog";
import { RunHistoryDialog } from "./run-history-dialog";
import "./workflow-editor.css";

function WorkflowEditorInner() {
  const {
    showOutput,
    selectedNode,
    showLoadDialog,
    showHistoryDialog,
    setShowLoadDialog,
    setShowHistoryDialog,
  } = useWorkflowStore();

  return (
    <div className="workflow-editor">
      <WorkflowToolbar />

      <div className="workflow-editor__body">
        <WorkflowCanvas />

        {selectedNode && !showOutput && <NodeEditPanel />}

        {showOutput && <OutputPanel />}
      </div>

      <LoadWorkflowDialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
      />

      <RunHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
      />
    </div>
  );
}

export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
}
