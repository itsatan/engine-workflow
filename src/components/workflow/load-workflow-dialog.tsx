import { useState, useEffect } from "react";
import { X, Loader2, Trash2, Clock } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow-store";
import type { Workflow } from "@/lib/workflow-types";
import "./dialogs.css";

interface LoadWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoadWorkflowDialog({ isOpen, onClose }: LoadWorkflowDialogProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { loadAll, load, deleteWorkflow } = useWorkflowStore();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const all = loadAll();
      setWorkflows(all);
      setLoading(false);
    }
  }, [isOpen, loadAll]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    deleteWorkflow(id);
    setWorkflows(workflows.filter((w) => w.id !== id));
    setDeleting(null);
  };

  const handleLoad = (id: string) => {
    load(id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal-content">
        <div className="modal-header">
          <h2>Load Workflow</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--workflow-text-muted)" }} />
            </div>
          ) : workflows.length === 0 ? (
            <div className="modal-empty">
              <p>No saved workflows</p>
              <p className="modal-empty-sub">Create and save a workflow to see it here</p>
            </div>
          ) : (
            <div>
              {workflows.map((workflow) => (
                <div key={workflow.id} className="workflow-list-item">
                  <div className="workflow-list-item__inner">
                    <button
                      type="button"
                      onClick={() => handleLoad(workflow.id)}
                      className="workflow-list-item__info"
                    >
                      <div className="workflow-list-item__name">
                        {workflow.name}
                      </div>
                      <div className="workflow-list-item__date">
                        <Clock size={12} />
                        {new Date(workflow.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(workflow.id, e)}
                      disabled={deleting === workflow.id}
                      className="workflow-list-item__delete"
                    >
                      {deleting === workflow.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
