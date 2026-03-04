import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { WorkflowNodeType, WorkflowNode, WorkflowNodeData } from "@/lib/workflow-types";
import {
  AITextNode,
  AIImageNode,
  ConditionNode,
  MemoryNode,
  GitHubNode,
  OutputNode,
  TextInputNode,
  MergeNode,
} from "./nodes";
import { WorkflowEdge } from "./custom-edge";
import { useWorkflowStore } from "@/store/workflow-store";
import "./workflow-canvas.css";

const nodeTypes: NodeTypes = {
  aiText: AITextNode,
  aiImage: AIImageNode,
  condition: ConditionNode,
  memory: MemoryNode,
  github: GitHubNode,
  output: OutputNode,
  textInput: TextInputNode,
  merge: MergeNode,
};

const edgeTypes: EdgeTypes = {
  workflow: WorkflowEdge,
};

const defaultNodeData: Record<WorkflowNodeType, WorkflowNodeData> = {
  aiText: {
    label: "AI Text",
    provider: "openai",
    model: "gpt-4o",
    prompt: "",
    systemPrompt: "",
    temperature: 0.7,
  },
  aiImage: {
    label: "AI Image",
    provider: "google",
    prompt: "",
    size: "1024x1024",
  },
  condition: {
    label: "Condition",
    condition: "",
    operator: "contains",
    value: "",
  },
  memory: {
    label: "Memory",
    memoryKey: "",
    operation: "read",
    dataType: "text",
    defaultValue: "",
  },
  github: {
    label: "GitHub",
    githubUrl: "",
    branch: "main",
    fetchReadme: true,
    fetchStructure: true,
    fetchKeyFiles: false,
  },
  output: {
    label: "Output",
    outputType: "readme-md",
    agentType: undefined,
    customFilename: "",
    customTemplate: "",
  },
  textInput: {
    label: "Text Input",
    text: "",
  },
  merge: {
    label: "Merge",
    separator: "\n\n",
  },
};

export function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes } = useWorkflowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const themedEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      type: "workflow",
      style: {
        ...edge.style,
        strokeWidth: 2,
        stroke: "#52525b",
      },
    }));
  }, [edges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow") as WorkflowNodeType;
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 140,
        y: event.clientY - bounds.top - 20,
      };

      const newNode: WorkflowNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { ...defaultNodeData[type] },
      };

      setNodes([...nodes, newNode]);
    },
    [nodes, setNodes]
  );

  const handleConnect = useCallback(
    (params: Connection) => {
      onConnect(params);
    },
    [onConnect]
  );

  return (
    <div ref={reactFlowWrapper} className="workflow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={themedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.3,
          maxZoom: 0.85,
        }}
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: "workflow",
          style: { strokeWidth: 2, stroke: "#52525b" },
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#27272a"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#3f3f46"
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
