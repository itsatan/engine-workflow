import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowNodeType,
  WorkflowExecution,
  WorkflowNodeData,
  Workflow,
  ExecutionResult,
  EdgeExecutionData,
  NodeExecutionStatus,
  TextInputNodeData,
  MergeNodeData,
  OutputNodeData,
  ConditionNodeData,
} from '@/lib/workflow-types';
import { AGENT_TEMPLATES } from '@/lib/workflow-types';

const STORAGE_KEY = 'flowforge-workflows';
const EXECUTIONS_KEY_PREFIX = 'flowforge-executions-';

// Default node data factory
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

// Default initial nodes (README Generator template)
const initialNodes: WorkflowNode[] = [
  {
    id: "github-1",
    type: "github",
    position: { x: 50, y: 200 },
    data: {
      label: "GitHub Repo",
      githubUrl: "",
      branch: "main",
      fetchReadme: true,
      fetchStructure: true,
      fetchKeyFiles: true,
    },
  },
  {
    id: "ai-1",
    type: "aiText",
    position: { x: 450, y: 150 },
    data: {
      label: "Generate README",
      provider: "openai",
      model: "gpt-4o",
      prompt:
        "Based on the following repository context, generate a comprehensive README.md file with sections for: Overview, Features, Installation, Usage, API Reference (if applicable), and Contributing guidelines.\n\n{{input}}",
      systemPrompt: "You are a technical documentation expert.",
      temperature: 0.7,
    },
  },
  {
    id: "output-1",
    type: "output",
    position: { x: 900, y: 200 },
    data: {
      label: "README Output",
      outputType: "readme-md",
      customFilename: "README.md",
      customTemplate: "",
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "github-1", target: "ai-1", type: "workflow", animated: true },
  { id: "e2", source: "ai-1", target: "output-1", type: "workflow", animated: true },
];

// Topological sort for execution order
function topologicalSort(nodes: WorkflowNode[], edges: Edge[]): WorkflowNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }

  for (const edge of edges) {
    const current = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, current + 1);
    adjList.get(edge.source)?.push(edge.target);
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  const sorted: WorkflowNode[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      sorted.push(node);
    }
    for (const neighbor of adjList.get(nodeId) || []) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
}

// Format output based on node type
function formatOutput(data: OutputNodeData, input: string): string {
  if (data.outputType === "agents-md" && data.agentType) {
    const template = AGENT_TEMPLATES[data.agentType];
    return `${template.header}\n${input}`;
  }
  if (data.outputType === "custom" && data.customTemplate) {
    return data.customTemplate.replace(/\{\{content\}\}/g, input);
  }
  if (data.outputType === "github-wiki") {
    return `# Wiki Documentation\n\n${input}`;
  }
  if (data.outputType === "readme-md") {
    return `# README\n\n${input}`;
  }
  return input;
}

// Evaluate condition
function evaluateCondition(data: ConditionNodeData, input: string): boolean {
  const value = data.value;
  switch (data.operator) {
    case "contains":
      return input.toLowerCase().includes(value.toLowerCase());
    case "equals":
      return input === value;
    case "notEquals":
      return input !== value;
    case "greaterThan":
      return Number(input) > Number(value);
    case "lessThan":
      return Number(input) < Number(value);
    case "isEmpty":
      return !input || input.trim() === "";
    case "isNotEmpty":
      return !!input && input.trim() !== "";
    default:
      return false;
  }
}

interface WorkflowState {
  // State
  nodes: WorkflowNode[];
  edges: Edge[];
  workflowId: string | null;
  workflowName: string;
  hasChanges: boolean;
  isExecuting: boolean;
  execution: WorkflowExecution | null;
  showOutput: boolean;
  showLoadDialog: boolean;
  showHistoryDialog: boolean;
  selectedNode: WorkflowNode | null;

  // Execution status tracking
  nodeExecutionStatus: Record<string, NodeExecutionStatus>;
  nodeExecutionResults: Record<string, ExecutionResult>;
  edgeExecutionData: Record<string, EdgeExecutionData>;

  // Node/Edge change handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node operations
  addNode: (nodeType: WorkflowNodeType) => void;
  addNodeOnEdge: (edgeId: string, nodeType: WorkflowNodeType) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode["data"]>) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;

  // Workflow operations
  save: () => void;
  load: (id: string) => void;
  loadAll: () => Workflow[];
  deleteWorkflow: (id: string) => void;
  handleNew: () => void;
  handleClear: () => void;
  selectTemplate: (nodes: WorkflowNode[], edges: Edge[], name: string) => void;

  // UI state
  setSelectedNode: (node: WorkflowNode | null) => void;
  setShowOutput: (show: boolean) => void;
  setShowLoadDialog: (show: boolean) => void;
  setShowHistoryDialog: (show: boolean) => void;
  setWorkflowName: (name: string) => void;

  // Execution
  execute: () => void;
  selectHistoryRun: (output: string) => void;
  getRunHistory: () => WorkflowExecution[];
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  nodes: initialNodes,
  edges: initialEdges,
  workflowId: null,
  workflowName: "README Generator",
  hasChanges: false,
  isExecuting: false,
  execution: null,
  showOutput: false,
  showLoadDialog: false,
  showHistoryDialog: false,
  selectedNode: null,
  nodeExecutionStatus: {},
  nodeExecutionResults: {},
  edgeExecutionData: {},

  // Node/Edge change handlers
  onNodesChange: (changes) => {
    set((state) => {
      const newNodes = applyNodeChanges(changes, state.nodes) as WorkflowNode[];

      // Check for node selection
      let newSelectedNode = state.selectedNode;
      for (const change of changes) {
        if (change.type === "select" && change.selected) {
          const node = newNodes.find((n) => n.id === change.id);
          if (node) {
            newSelectedNode = node;
          }
        }
      }

      return {
        nodes: newNodes,
        hasChanges: true,
        selectedNode: newSelectedNode,
      };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      hasChanges: true,
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge({ ...connection, type: "workflow", animated: true }, state.edges),
      hasChanges: true,
    }));
  },

  // Node operations
  addNode: (nodeType) => {
    const state = get();
    const xOffset = 100 + state.nodes.length * 400;
    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: xOffset, y: 200 },
      data: { ...defaultNodeData[nodeType] },
    };
    set({
      nodes: [...state.nodes, newNode],
      hasChanges: true,
    });
  },

  addNodeOnEdge: (edgeId, nodeType) => {
    const state = get();
    const edge = state.edges.find((e) => e.id === edgeId);
    if (!edge) return;

    const sourceNode = state.nodes.find((n) => n.id === edge.source);
    const targetNode = state.nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const midX = (sourceNode.position.x + targetNode.position.x) / 2;
    const midY = (sourceNode.position.y + targetNode.position.y) / 2;

    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: midX, y: midY },
      data: { ...defaultNodeData[nodeType] },
    };

    const newEdges = state.edges.filter((e) => e.id !== edgeId);
    const newEdge1: Edge = {
      id: `e-${edge.source}-${newNode.id}`,
      source: edge.source,
      sourceHandle: edge.sourceHandle ?? undefined,
      target: newNode.id,
      type: "workflow",
      animated: true,
    };
    const newEdge2: Edge = {
      id: `e-${newNode.id}-${edge.target}`,
      source: newNode.id,
      target: edge.target,
      targetHandle: edge.targetHandle ?? undefined,
      type: "workflow",
      animated: true,
    };

    set({
      nodes: [...state.nodes, newNode],
      edges: [...newEdges, newEdge1, newEdge2],
      hasChanges: true,
    });
  },

  updateNode: (nodeId, data) => {
    set((state) => {
      const newNodes = state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as WorkflowNode["data"] }
          : node
      );
      const newSelectedNode =
        state.selectedNode && state.selectedNode.id === nodeId
          ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...data } as WorkflowNode["data"] }
          : state.selectedNode;
      return {
        nodes: newNodes,
        selectedNode: newSelectedNode,
        hasChanges: true,
      };
    });
  },

  setNodes: (nodes) => set({ nodes, hasChanges: true }),
  setEdges: (edges) => set({ edges, hasChanges: true }),

  // Workflow operations - localStorage
  save: () => {
    const state = get();
    const workflowId = state.workflowId || crypto.randomUUID();
    const now = new Date().toISOString();

    const workflow: Workflow = {
      id: workflowId,
      name: state.workflowName,
      nodes: state.nodes,
      edges: state.edges,
      createdAt: now,
      updatedAt: now,
    };

    // Read existing workflows
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Workflow[];
    const index = existing.findIndex((w) => w.id === workflowId);

    if (index >= 0) {
      workflow.createdAt = existing[index].createdAt;
      existing[index] = workflow;
    } else {
      existing.push(workflow);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    set({ workflowId, hasChanges: false });
  },

  load: (id) => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Workflow[];
    const workflow = existing.find((w) => w.id === id);
    if (workflow) {
      set({
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        hasChanges: false,
        showLoadDialog: false,
        selectedNode: null,
      });
    }
  },

  loadAll: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Workflow[];
  },

  deleteWorkflow: (id) => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Workflow[];
    const filtered = existing.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    // Also delete execution history
    localStorage.removeItem(`${EXECUTIONS_KEY_PREFIX}${id}`);
  },

  handleNew: () => {
    set({
      workflowId: null,
      workflowName: "Untitled Workflow",
      nodes: [],
      edges: [],
      hasChanges: false,
      execution: null,
      selectedNode: null,
      nodeExecutionStatus: {},
      nodeExecutionResults: {},
      edgeExecutionData: {},
    });
  },

  handleClear: () => {
    set({
      nodes: [],
      edges: [],
      hasChanges: true,
      selectedNode: null,
      nodeExecutionStatus: {},
      nodeExecutionResults: {},
      edgeExecutionData: {},
    });
  },

  selectTemplate: (nodes, edges, name) => {
    set({
      workflowId: null,
      workflowName: name,
      nodes,
      edges,
      hasChanges: true,
      selectedNode: null,
      nodeExecutionStatus: {},
      nodeExecutionResults: {},
      edgeExecutionData: {},
    });
  },

  // UI state
  setSelectedNode: (node) => set({ selectedNode: node }),
  setShowOutput: (show) => set({ showOutput: show }),
  setShowLoadDialog: (show) => set({ showLoadDialog: show }),
  setShowHistoryDialog: (show) => set({ showHistoryDialog: show }),
  setWorkflowName: (name) => set({ workflowName: name, hasChanges: true }),

  // Execution - async per-node simulated execution with timing
  execute: () => {
    const state = get();
    if (state.nodes.length === 0) return;

    // Initialize all nodes as waiting
    const initialStatus: Record<string, NodeExecutionStatus> = {};
    for (const node of state.nodes) {
      initialStatus[node.id] = 'waiting';
    }

    set({
      isExecuting: true,
      showOutput: true,
      execution: null,
      nodeExecutionStatus: initialStatus,
      nodeExecutionResults: {},
      edgeExecutionData: {},
    });

    // Run async execution
    (async () => {
      const { nodes, edges, workflowId } = get();
      const nodeOutputs = new Map<string, string>();
      const results: ExecutionResult[] = [];
      const edgeResults: EdgeExecutionData[] = [];
      const sortedNodes = topologicalSort(nodes, edges);
      let finalOutput = "";

      for (const node of sortedNodes) {
        // Mark current node as running
        set((s) => ({
          nodeExecutionStatus: { ...s.nodeExecutionStatus, [node.id]: 'running' as NodeExecutionStatus },
        }));

        const nodeStartTime = performance.now();

        // Get inputs from connected nodes
        const incomingEdges = edges.filter((e) => e.target === node.id);
        const inputs: string[] = [];
        for (const edge of incomingEdges) {
          const output = nodeOutputs.get(edge.source);
          if (output !== undefined) {
            inputs.push(output);
          }
          const edgeData: EdgeExecutionData = {
            edgeId: edge.id,
            durationMs: Math.max(Math.round(Math.random() * 5 + 1), 1),
            dataSize: output?.length,
          };
          edgeResults.push(edgeData);
          set((s) => ({
            edgeExecutionData: { ...s.edgeExecutionData, [edge.id]: edgeData },
          }));
        }
        const combinedInput = inputs.join("\n\n");
        let output = "";

        // Simulate per-node async delay (200-600ms)
        await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));

        switch (node.type as WorkflowNodeType) {
          case "textInput": {
            const data = node.data as TextInputNodeData;
            output = data.text;
            break;
          }
          case "github": {
            output = `[Simulated] GitHub repository data for: ${(node.data as { githubUrl?: string }).githubUrl || "no URL"}`;
            break;
          }
          case "aiText": {
            const prompt = (node.data as { prompt: string }).prompt.replace(/\{\{input\}\}/g, combinedInput);
            output = `[Simulated AI Response]\n\nPrompt: ${prompt.slice(0, 200)}...\n\nThis is a simulated response. Connect a real backend API to get actual AI-generated content.`;
            break;
          }
          case "condition": {
            const data = node.data as ConditionNodeData;
            const condResult = evaluateCondition(data, combinedInput);
            output = condResult ? "true" : "false";
            break;
          }
          case "merge": {
            const data = node.data as MergeNodeData;
            const separator = data.separator.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
            output = inputs.join(separator);
            break;
          }
          case "memory": {
            output = combinedInput || (node.data as { defaultValue?: string }).defaultValue || "";
            break;
          }
          case "output": {
            const data = node.data as OutputNodeData;
            output = formatOutput(data, combinedInput);
            finalOutput = output;
            break;
          }
          default:
            output = combinedInput;
        }

        const durationMs = Math.round(performance.now() - nodeStartTime);
        const now = new Date().toISOString();

        const result: ExecutionResult = {
          nodeId: node.id,
          nodeType: node.type as WorkflowNodeType,
          output,
          timestamp: now,
          durationMs,
          startedAt: new Date(Date.now() - durationMs).toISOString(),
          completedAt: now,
        };

        results.push(result);
        nodeOutputs.set(node.id, output);

        // Mark node as success and store result
        set((s) => ({
          nodeExecutionStatus: { ...s.nodeExecutionStatus, [node.id]: 'success' as NodeExecutionStatus },
          nodeExecutionResults: { ...s.nodeExecutionResults, [node.id]: result },
        }));
      }

      if (!finalOutput && results.length > 0) {
        finalOutput = results[results.length - 1].output || "";
      }

      const execution: WorkflowExecution = {
        id: crypto.randomUUID(),
        workflowId: workflowId || "",
        status: "completed",
        results,
        edgeResults,
        finalOutput,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      // Save execution to localStorage
      if (workflowId) {
        const key = `${EXECUTIONS_KEY_PREFIX}${workflowId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]') as WorkflowExecution[];
        existing.unshift(execution);
        // Keep only last 20 executions
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
      }

      set({ execution, isExecuting: false });
    })();
  },

  selectHistoryRun: (output) => {
    set({
      execution: {
        id: crypto.randomUUID(),
        workflowId: get().workflowId || "",
        status: "completed",
        results: [],
        edgeResults: [],
        finalOutput: output,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      showOutput: true,
    });
  },

  getRunHistory: () => {
    const { workflowId } = get();
    if (!workflowId) return [];
    const key = `${EXECUTIONS_KEY_PREFIX}${workflowId}`;
    return JSON.parse(localStorage.getItem(key) || '[]') as WorkflowExecution[];
  },
}));
