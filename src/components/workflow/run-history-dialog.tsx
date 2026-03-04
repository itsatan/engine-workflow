import { useState, useEffect } from "react";
import { X, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow-store";
import type { WorkflowExecution } from "@/lib/workflow-types";
import "./dialogs.css";

interface RunHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RunHistoryDialog({ isOpen, onClose }: RunHistoryDialogProps) {
  const [history, setHistory] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const { workflowId, getRunHistory, selectHistoryRun } = useWorkflowStore();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const runs = getRunHistory();
      setHistory(runs);
      setLoading(false);
    }
  }, [isOpen, getRunHistory]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-left">
            <Clock size={20} style={{ color: "var(--workflow-text-muted)" }} />
            <h2>Run History</h2>
          </div>
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
          ) : !workflowId ? (
            <div className="modal-empty">
              Save your workflow first to view run history
            </div>
          ) : history.length === 0 ? (
            <div className="modal-empty">
              No runs yet
            </div>
          ) : (
            <div>
              {history.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => {
                    if (run.finalOutput) {
                      selectHistoryRun(run.finalOutput);
                      onClose();
                    }
                  }}
                  className="history-item"
                >
                  <div className="history-item__top">
                    <div className="history-item__status">
                      {run.status === "completed" ? (
                        <CheckCircle2 size={16} style={{ color: "var(--color-emerald-500)" }} />
                      ) : run.status === "failed" ? (
                        <XCircle size={16} style={{ color: "var(--color-rose-400)" }} />
                      ) : (
                        <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-amber-500)" }} />
                      )}
                      <span>{run.status}</span>
                    </div>
                    <span className="history-item__time">
                      {new Date(run.startedAt).toLocaleString()}
                    </span>
                  </div>
                  {run.finalOutput && (
                    <p className="history-item__preview">
                      {run.finalOutput.slice(0, 100)}...
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
