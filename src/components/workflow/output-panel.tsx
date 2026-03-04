import { useState } from "react";
import { Download, Copy, Check, FileText, Code, X, Loader2 } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow-store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./output-panel.css";

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`{3}[\s\S]*?`{3}/g, (match) => match.replace(/`{3}\w*\n?/g, ""))
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^[\s]*[-*+]\s+/gm, "- ")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function OutputPanel() {
  const { execution, isExecuting, setShowOutput } = useWorkflowStore();
  const [view, setView] = useState<"text" | "markdown">("markdown");
  const [copied, setCopied] = useState(false);

  const onClose = () => setShowOutput(false);

  const handleCopy = async () => {
    if (execution?.finalOutput) {
      await navigator.clipboard.writeText(execution.finalOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (execution?.finalOutput) {
      const blob = new Blob([execution.finalOutput], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="output-panel">
      <div className="output-panel__header">
        <div className="output-panel__header-info">
          <h2>Output</h2>
          <p>
            {isExecuting ? "Executing workflow..." : execution ? "Execution complete" : "Run workflow to see output"}
          </p>
        </div>
        <button type="button" onClick={onClose} className="output-panel__close">
          <X size={16} />
        </button>
      </div>

      {isExecuting && (
        <div className="output-panel__loading">
          <div className="output-panel__loading-inner">
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-emerald-500)", margin: "0 auto" }} />
            <p className="output-panel__loading-text">Processing nodes...</p>
          </div>
        </div>
      )}

      {!isExecuting && execution && (
        <>
          <div className="output-panel__view-toggle">
            <button
              type="button"
              onClick={() => setView("markdown")}
              className={`output-panel__view-btn${view === "markdown" ? " output-panel__view-btn--active" : ""}`}
            >
              <FileText size={14} />
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setView("text")}
              className={`output-panel__view-btn${view === "text" ? " output-panel__view-btn--active" : ""}`}
            >
              <Code size={14} />
              Raw Text
            </button>
          </div>

          <div className="output-panel__content">
            {view === "markdown" ? (
              <div className="output-panel__markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {execution.finalOutput || "No output"}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="output-panel__raw">
                {stripMarkdown(execution.finalOutput || "No output")}
              </div>
            )}
          </div>

          <div className="output-panel__actions">
            <button type="button" onClick={handleCopy} className="output-panel__action-btn output-panel__action-btn--copy">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button type="button" onClick={handleDownload} className="output-panel__action-btn output-panel__action-btn--download">
              <Download size={14} />
              Download
            </button>
          </div>

          {execution.results.length > 0 && (
            <div className="output-panel__log">
              <div className="output-panel__log-title">Execution Log</div>
              <div>
                {execution.results.map((result, i) => (
                  <div
                    key={`${result.nodeId}-${i}`}
                    className={`output-panel__log-item ${result.error ? "output-panel__log-item--error" : "output-panel__log-item--ok"}`}
                  >
                    <span className="output-panel__log-item-type">[{result.nodeType}]</span>{" "}
                    {result.error || "OK"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!isExecuting && !execution && (
        <div className="output-panel__empty">
          <div className="output-panel__empty-inner">
            <FileText size={48} className="output-panel__empty-icon" />
            <p className="output-panel__empty-text">No output yet</p>
            <p className="output-panel__empty-sub">Execute your workflow to generate output</p>
          </div>
        </div>
      )}
    </div>
  );
}
