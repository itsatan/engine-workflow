import { X } from "lucide-react";
import type { WorkflowNode, WorkflowNodeType } from "@/lib/workflow-types";
import { AI_MODELS, AGENT_TEMPLATES } from "@/lib/workflow-types";
import { useWorkflowStore } from "@/store/workflow-store";
import "./node-edit-panel.css";

export function NodeEditPanel() {
  const { selectedNode: node, updateNode, setSelectedNode } = useWorkflowStore();

  if (!node) return null;

  const handleChange = (key: string, value: unknown) => {
    updateNode(node.id, { ...node.data, [key]: value });
  };

  const onClose = () => setSelectedNode(null);

  return (
    <div className="node-edit-panel">
      <div className="node-edit-panel__header">
        <div className="node-edit-panel__header-info">
          <h2>{node.data.label}</h2>
          <p>Edit node properties</p>
        </div>
        <button type="button" onClick={onClose} className="node-edit-panel__close">
          <X size={16} />
        </button>
      </div>

      <div className="node-edit-panel__body">
        {/* Label */}
        <div className="edit-field">
          <label>Label</label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => handleChange("label", e.target.value)}
          />
        </div>

        {/* AI Text Node */}
        {node.type === "aiText" && (
          <>
            <div className="edit-field-row">
              <div className="edit-field">
                <label>Provider</label>
                <select
                  value={(node.data as { provider: string }).provider}
                  onChange={(e) => handleChange("provider", e.target.value)}
                >
                  <option value="openai">OpenAI</option>
                  <option value="google">Google</option>
                  <option value="xai">xAI</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Model</label>
                <select
                  value={(node.data as { model: string }).model}
                  onChange={(e) => handleChange("model", e.target.value)}
                >
                  {AI_MODELS[(node.data as { provider: "openai" | "google" | "xai" }).provider].map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="edit-field">
              <label>System Prompt</label>
              <textarea
                value={(node.data as { systemPrompt?: string }).systemPrompt || ""}
                onChange={(e) => handleChange("systemPrompt", e.target.value)}
                placeholder="Optional system instructions..."
                style={{ height: "5rem" }}
              />
            </div>
            <div className="edit-field">
              <label>Prompt</label>
              <textarea
                value={(node.data as { prompt: string }).prompt}
                onChange={(e) => handleChange("prompt", e.target.value)}
                placeholder="Enter prompt... Use {{input}} for data from connected nodes"
                style={{ height: "7rem" }}
              />
            </div>
            <div className="edit-field">
              <label>Temperature: {(node.data as { temperature?: number }).temperature ?? 0.7}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={(node.data as { temperature?: number }).temperature ?? 0.7}
                onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
              />
            </div>
          </>
        )}

        {/* AI Image Node */}
        {node.type === "aiImage" && (
          <>
            <div className="edit-field">
              <label>Size</label>
              <select
                value={(node.data as { size?: string }).size || "1024x1024"}
                onChange={(e) => handleChange("size", e.target.value)}
              >
                <option value="1024x1024">1024x1024</option>
                <option value="512x512">512x512</option>
                <option value="1792x1024">1792x1024</option>
              </select>
            </div>
            <div className="edit-field">
              <label>Prompt</label>
              <textarea
                value={(node.data as { prompt: string }).prompt}
                onChange={(e) => handleChange("prompt", e.target.value)}
                placeholder="Describe the image..."
                style={{ height: "7rem" }}
              />
            </div>
          </>
        )}

        {/* GitHub Node */}
        {node.type === "github" && (
          <>
            <div className="edit-field">
              <label>GitHub URL</label>
              <input
                type="text"
                value={(node.data as { githubUrl: string }).githubUrl || ""}
                onChange={(e) => handleChange("githubUrl", e.target.value)}
                placeholder="https://github.com/vercel/next.js"
              />
              <p style={{ fontSize: "0.75rem", color: "var(--workflow-text-subtle)", marginTop: "0.25rem" }}>
                Paste a repo or profile URL
              </p>
            </div>
            <div className="edit-field">
              <label>Branch</label>
              <input
                type="text"
                value={(node.data as { branch?: string }).branch || "main"}
                onChange={(e) => handleChange("branch", e.target.value)}
              />
            </div>
            <div className="edit-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={(node.data as { fetchReadme: boolean }).fetchReadme}
                  onChange={(e) => handleChange("fetchReadme", e.target.checked)}
                />
                <span>Fetch README</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={(node.data as { fetchStructure: boolean }).fetchStructure}
                  onChange={(e) => handleChange("fetchStructure", e.target.checked)}
                />
                <span>Fetch file structure</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={(node.data as { fetchKeyFiles: boolean }).fetchKeyFiles}
                  onChange={(e) => handleChange("fetchKeyFiles", e.target.checked)}
                />
                <span>Fetch key files</span>
              </label>
            </div>
          </>
        )}

        {/* Memory Node */}
        {node.type === "memory" && (
          <>
            <div className="edit-field">
              <label>Memory Key</label>
              <input
                type="text"
                value={(node.data as { memoryKey: string }).memoryKey}
                onChange={(e) => handleChange("memoryKey", e.target.value)}
                placeholder="user_context"
              />
            </div>
            <div className="edit-field-row">
              <div className="edit-field">
                <label>Operation</label>
                <select
                  value={(node.data as { operation: string }).operation}
                  onChange={(e) => handleChange("operation", e.target.value)}
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Data Type</label>
                <select
                  value={(node.data as { dataType: string }).dataType}
                  onChange={(e) => handleChange("dataType", e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="url">URL</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
            {(node.data as { operation: string }).operation === "read" && (
              <div className="edit-field">
                <label>Default Value</label>
                <input
                  type="text"
                  value={(node.data as { defaultValue?: string }).defaultValue || ""}
                  onChange={(e) => handleChange("defaultValue", e.target.value)}
                  placeholder="Value if not found"
                />
              </div>
            )}
          </>
        )}

        {/* Condition Node */}
        {node.type === "condition" && (
          <>
            <div className="edit-field">
              <label>Variable</label>
              <input
                type="text"
                value={(node.data as { condition: string }).condition}
                onChange={(e) => handleChange("condition", e.target.value)}
                placeholder="{{input}}"
              />
            </div>
            <div className="edit-field">
              <label>Operator</label>
              <select
                value={(node.data as { operator: string }).operator}
                onChange={(e) => handleChange("operator", e.target.value)}
              >
                <option value="contains">contains</option>
                <option value="equals">equals</option>
                <option value="notEquals">not equals</option>
                <option value="greaterThan">greater than</option>
                <option value="lessThan">less than</option>
                <option value="isEmpty">is empty</option>
                <option value="isNotEmpty">is not empty</option>
              </select>
            </div>
            {!["isEmpty", "isNotEmpty"].includes((node.data as { operator: string }).operator) && (
              <div className="edit-field">
                <label>Value</label>
                <input
                  type="text"
                  value={(node.data as { value: string }).value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  placeholder="Comparison value"
                />
              </div>
            )}
          </>
        )}

        {/* Output Node */}
        {node.type === "output" && (
          <>
            <div className="edit-field">
              <label>Output Type</label>
              <select
                value={(node.data as { outputType: string }).outputType}
                onChange={(e) => handleChange("outputType", e.target.value)}
              >
                <option value="github-wiki">GitHub Wiki</option>
                <option value="agents-md">agents.md</option>
                <option value="readme-md">README.md</option>
                <option value="custom">Custom Document</option>
              </select>
            </div>
            {(node.data as { outputType: string }).outputType === "agents-md" && (
              <div className="edit-field">
                <label>Agent Type</label>
                <div className="edit-agent-grid">
                  {Object.entries(AGENT_TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleChange("agentType", key)}
                      className={`edit-agent-btn${(node.data as { agentType?: string }).agentType === key ? " edit-agent-btn--active" : ""}`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(node.data as { outputType: string }).outputType === "custom" && (
              <>
                <div className="edit-field">
                  <label>Filename</label>
                  <input
                    type="text"
                    value={(node.data as { customFilename?: string }).customFilename || ""}
                    onChange={(e) => handleChange("customFilename", e.target.value)}
                    placeholder="my-doc.md"
                  />
                </div>
                <div className="edit-field">
                  <label>Template</label>
                  <textarea
                    value={(node.data as { customTemplate?: string }).customTemplate || ""}
                    onChange={(e) => handleChange("customTemplate", e.target.value)}
                    placeholder="Use {{content}} for generated content"
                    style={{ height: "6rem" }}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Text Input Node */}
        {node.type === "textInput" && (
          <div className="edit-field">
            <label>Text Content</label>
            <textarea
              value={(node.data as { text: string }).text}
              onChange={(e) => handleChange("text", e.target.value)}
              placeholder="Enter your text content..."
              style={{ height: "10rem" }}
            />
          </div>
        )}

        {/* Merge Node */}
        {node.type === "merge" && (
          <div className="edit-field">
            <label>Separator</label>
            <select
              value={(node.data as { separator: string }).separator}
              onChange={(e) => handleChange("separator", e.target.value)}
            >
              <option value={"\n\n"}>Double newline</option>
              <option value={"\n"}>Single newline</option>
              <option value={"\n---\n"}>Horizontal rule</option>
              <option value=" ">Space</option>
              <option value="">No separator</option>
            </select>
          </div>
        )}

        {/* Group Node */}
        {node.type === "group" && (
          <div className="edit-field">
            <label>Content</label>
            <textarea
              value={(node.data as { content?: string }).content || ""}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Group notes..."
              style={{ height: "8rem" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
