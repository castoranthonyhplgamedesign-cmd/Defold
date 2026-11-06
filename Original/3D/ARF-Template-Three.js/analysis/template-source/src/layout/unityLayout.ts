export type Vec = { x: number; y: number; z: number };
export type LayoutNode = {
  name: string;
  type: string;
  position: Vec;
  worldEulerAngles: Vec;
  lossyScale: Vec;
  mesh?: string;
  sprite?: string;
  color?: { r: number; g: number; b: number; a: number };
  boundsSize?: Vec;
  orthographicSize?: number;
  intensity?: number;
  pathIndex?: number;
  exitDirection?: Vec;
  blockColor?: string;
  children?: LayoutNode[];
};

export function findNode(name: string, roots: LayoutNode[]): LayoutNode {
  for (const node of roots) {
    if (node.name === name) return node;
    if (node.children) {
      try { return findNode(name, node.children); } catch { /* search the next branch */ }
    }
  }
  throw new Error(`Missing layout node: ${name}`);
}

/** Every object with a direct head child is an independent arrow, at any nesting depth. */
export function findArrowGroups(roots: LayoutNode[], headMeshName: string): LayoutNode[][] {
  const groups: LayoutNode[][] = [];
  function visit(node: LayoutNode) {
    if (node.children?.some((child) => child.mesh === headMeshName)) groups.push(node.children);
    for (const child of node.children ?? []) visit(child);
  }
  for (const root of roots) visit(root);
  return groups;
}
