import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { GitHubNodeData } from "@/lib/workflow-types";

function GitHubNodeComponent({ data, selected, ...props }: NodeProps<GitHubNodeData>) {
  return (
    <BaseNode nodeType="github" data={data} selected={selected} hasInput={false} {...props} />
  );
}

export const GitHubNode = memo(GitHubNodeComponent);
