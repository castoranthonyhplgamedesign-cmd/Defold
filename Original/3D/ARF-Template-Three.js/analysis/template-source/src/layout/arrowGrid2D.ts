export type GridPoint2D = { x: number; y: number };

export type Arrow2D = {
  fileID: string;
  isThin: boolean;
  exitDirection: 'Top' | 'Bottom' | 'Left' | 'Right';
  headPosition: GridPoint2D;
  bodyOffsets: GridPoint2D[];
  style: { color: string };
};

export type ArrowGrid2DLayout = {
  name: string;
  arrowCount: number;
  gridBounds: { minX: number; minY: number; width: number; height: number };
  arrows: Arrow2D[];
};

export type MappedArrow = {
  id: string;
  color: string;
  exitDirection: { x: number; z: number };
  points: { x: number; z: number }[];
};

/** Places a Point Out 2D grid flat on the Babylon X/Z board, with 2D up toward -Z. */
export function mapArrowGrid2D(
  layout: ArrowGrid2DLayout,
  center: { x: number; z: number },
  cellSize: number,
  colorNames: Record<string, string>,
): MappedArrow[] {
  if (layout.arrowCount !== layout.arrows.length) throw new Error('2D arrowCount does not match arrows');
  const bounds = layout.gridBounds;
  if (bounds.width < 1 || bounds.height < 1 || cellSize <= 0) throw new Error('Invalid 2D grid size');
  const centerX = bounds.minX + (bounds.width - 1) / 2;
  const centerY = bounds.minY + (bounds.height - 1) / 2;
  const occupied = new Set<string>();
  const mapped: MappedArrow[] = [];
  for (let i = 0; i < layout.arrows.length; i++) {
    const arrow = layout.arrows[i];
    const color = colorNames[arrow.style.color.toLowerCase()];
    if (!color) throw new Error(`Unsupported 2D arrow color: ${arrow.style.color}`);
    const exitDirection = arrow.exitDirection === 'Top' ? { x: 0, z: -1 }
      : arrow.exitDirection === 'Bottom' ? { x: 0, z: 1 }
        : arrow.exitDirection === 'Left' ? { x: -1, z: 0 }
          : arrow.exitDirection === 'Right' ? { x: 1, z: 0 } : null;
    if (!exitDirection) throw new Error(`Unsupported 2D exit direction: ${arrow.exitDirection}`);
    const cells = [arrow.headPosition];
    for (let j = 0; j < arrow.bodyOffsets.length; j++) {
      const offset = arrow.bodyOffsets[j];
      cells.push({ x: arrow.headPosition.x + offset.x, y: arrow.headPosition.y + offset.y });
    }
    const points: { x: number; z: number }[] = [];
    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      if (!Number.isInteger(cell.x) || !Number.isInteger(cell.y)
        || cell.x < bounds.minX || cell.x >= bounds.minX + bounds.width
        || cell.y < bounds.minY || cell.y >= bounds.minY + bounds.height) {
        throw new Error(`Arrow ${arrow.fileID} has a cell outside gridBounds`);
      }
      if (j > 0 && Math.abs(cell.x - cells[j - 1].x) + Math.abs(cell.y - cells[j - 1].y) !== 1) {
        throw new Error(`Arrow ${arrow.fileID} bodyOffsets are not ordered adjacent cells`);
      }
      const key = `${cell.x},${cell.y}`;
      if (occupied.has(key)) throw new Error(`Overlapping 2D arrow cells at ${key}`);
      occupied.add(key);
      points.push({ x: center.x + (cell.x - centerX) * cellSize,
        z: center.z - (cell.y - centerY) * cellSize });
    }
    mapped.push({ id: arrow.fileID, color, exitDirection, points });
  }
  return mapped;
}
