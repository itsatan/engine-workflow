import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "../base-node";
import type { TextInputNodeData } from "@/lib/workflow-types";

function TextInputNodeComponent({ data, selected, ...props }: NodeProps<TextInputNodeData>) {
  return (
    <BaseNode nodeType="textInput" data={data} selected={selected} hasInput={false} {...props} />
  );
}

export const TextInputNode = memo(TextInputNodeComponent);
