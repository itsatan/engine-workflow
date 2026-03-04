import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { GitHubNodeData } from "@/lib/workflow-types";
import "./nodes.css";

function GitHubNodeComponent({ data, selected, ...props }: NodeProps<GitHubNodeData>) {
  const parseGitHubUrl = (url: string) => {
    if (!url) return { owner: "", repo: "" };
    const match = url.match(/github\.com\/([^/]+)(?:\/([^/]+))?/);
    if (match) {
      return { owner: match[1], repo: match[2] || "" };
    }
    const parts = url.replace(/^https?:\/\//, "").split("/");
    return { owner: parts[0] || "", repo: parts[1] || "" };
  };

  const { owner, repo } = parseGitHubUrl(data.githubUrl || "");
  const displayText = repo ? `${owner}/${repo}` : owner || "Enter GitHub URL";

  return (
    <BaseNode nodeType="github" data={data} selected={selected} hasInput={false} {...props}>
      <div className="node-field">
        <div className="node-display">{displayText}</div>
        {data.branch && data.branch !== "main" && (
          <div className="node-text-muted">Branch: {data.branch}</div>
        )}
        <div className="node-field-row" style={{ flexWrap: "wrap" }}>
          {data.fetchReadme && <span className="node-badge">README</span>}
          {data.fetchStructure && <span className="node-badge">Structure</span>}
          {data.fetchKeyFiles && <span className="node-badge">Files</span>}
        </div>
      </div>
    </BaseNode>
  );
}

export const GitHubNode = memo(GitHubNodeComponent);
