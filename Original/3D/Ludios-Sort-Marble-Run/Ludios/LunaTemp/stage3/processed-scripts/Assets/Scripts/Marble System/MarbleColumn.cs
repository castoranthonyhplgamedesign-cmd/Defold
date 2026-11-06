using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Manages a column of marbles. A marble is clickable if:
///   (a) it is the direct front of its column (no marble blocking its forward path), OR
///   (b) a path exists through a combination of forward rolls within columns and lateral
///       rolls between adjacent columns, ending at a column whose spawn point is reachable.
///
/// Path-finding uses BFS over (column, depth) states:
///   • Advance: (col, d) → (col, d-1)  if col's marble at d-1 has departed
///   • Lateral:  (col, d) → (neighbor, d)  if neighbor's marble at d has departed
///   • Terminal: any (col, d) where all marbles 0..d in col have departed
///
/// Attach this to each column parent Transform that holds marble children.
/// </summary>
public class MarbleColumn : MonoBehaviour
{
    [Header("Neighbors")]
    [Tooltip("Column immediately to the left. Auto-assigned by MarbleBoardGenerator.")]
    [SerializeField] private MarbleColumn leftNeighbor;

    [Tooltip("Column immediately to the right. Auto-assigned by MarbleBoardGenerator.")]
    [SerializeField] private MarbleColumn rightNeighbor;

    // Neighbor accessors used by BFS when walking the column graph.
    public MarbleColumn LeftNeighbor  => leftNeighbor;
    public MarbleColumn RightNeighbor => rightNeighbor;

    private List<Marble>  marbles              = new List<Marble>();
    private List<Vector3> marbleWorldPositions = new List<Vector3>(); // cached before any movement
    private HashSet<int>  departedIndices      = new HashSet<int>();

    #region Unity LifeCycle
    private void Start()
    {
        foreach (Transform child in transform)
        {
            var marble = child.GetComponent<Marble>();
            if (marble != null)
            {
                marbles.Add(marble);
                marbleWorldPositions.Add(child.position); // must be cached before marble moves
            }
        }

        // Keep all colliders disabled until the intro camera pan completes.
        LockAllMarbles();
        Tray.OnWrongColorEntered += LockAllMarbles;
        MarbleIntroAnimation.OnIntroPanComplete += OnIntroPanComplete;
    }

    private void OnDestroy()
    {
        Tray.OnWrongColorEntered -= LockAllMarbles;
        MarbleIntroAnimation.OnIntroPanComplete -= OnIntroPanComplete;
    }
    #endregion

    #region Public API
    /// <summary>Original list index of the marble (0 = front-most at spawn time). -1 if not found.</summary>
    public int GetOriginalIndex(Marble marble) => marbles.IndexOf(marble);

    /// <summary>Lowest index still present in the column (-1 if all gone).</summary>
    public int FrontIndex
    {
        get
        {
            for (int i = 0; i < marbles.Count; i++)
                if (!departedIndices.Contains(i)) return i;
            return -1;
        }
    }

    /// <summary>True if the marble at the given index has fully departed from this column.</summary>
    public bool HasDepartedAtIndex(int index) => departedIndices.Contains(index);

    /// <summary>
    /// True if every marble at indices 0 through marbleIndex has departed.
    /// This means a marble arriving at that depth can roll all the way forward
    /// to this column's spawn without obstruction.
    /// </summary>
    public bool IsPathClearForIndex(int marbleIndex)
    {
        for (int i = 0; i <= marbleIndex; i++)
            if (!departedIndices.Contains(i)) return false;
        return true;
    }

    /// <summary>Cached world position of the slot where the marble at the given index originally sat.</summary>
    public Vector3 GetSlotWorldPosition(int index)
    {
        if (index >= 0 && index < marbleWorldPositions.Count)
            return marbleWorldPositions[index];
        return transform.position;
    }

    /// <summary>
    /// Attempts to find a movement path for a marble at <paramref name="marbleIndex"/> that is
    /// NOT the direct front of this column, using BFS over (column, depth) states.
    ///
    /// From any state (col, d) the marble may:
    ///   • Advance forward within col if col's slot at d-1 has departed → (col, d-1)
    ///   • Roll laterally to a neighbor if that neighbor's slot at d has departed → (neighbor, d)
    ///
    /// A state is terminal when IsPathClearForIndex(d) is true for that column — meaning
    /// the marble can roll unobstructed from depth d all the way to the column's spawn.
    ///
    /// Returns true and fills <paramref name="preSwerveWaypoints"/> (ordered world positions
    /// to visit before the swerve/drop phase) and <paramref name="spawnPoint"/> (the target
    /// column's spawn, where the swerve begins).
    /// </summary>
    public bool TryGetMovementPath(int marbleIndex,
                                   out List<Vector3> preSwerveWaypoints,
                                   out Vector3       spawnPoint)
    {
        preSwerveWaypoints = null;
        spawnPoint         = Vector3.zero;

        var queue   = new Queue<BFSState>();
        var visited = new HashSet<BFSState>();
        var parent  = new Dictionary<BFSState, BFSState>();

        var startState = new BFSState(this, marbleIndex);
        queue.Enqueue(startState);
        visited.Add(startState);

        BFSState terminalState = default(MarbleColumn.BFSState);
        bool found = false;

        while (queue.Count > 0)
        {
            BFSState current = queue.Dequeue();

            if (current.Col.IsPathClearForIndex(current.Depth))
            {
                terminalState = current;
                found = true;
                break;
            }

            // Advance forward within the same column (decrease depth)
            if (current.Depth > 0 && current.Col.HasDepartedAtIndex(current.Depth - 1))
            {
                var next = new BFSState(current.Col, current.Depth - 1);
                if (!visited.Contains(next))
                {
                    visited.Add(next);
                    parent[next] = current;
                    queue.Enqueue(next);
                }
            }

            // Lateral roll to left neighbor
            if (current.Col.leftNeighbor != null && current.Col.leftNeighbor.HasDepartedAtIndex(current.Depth))
            {
                var next = new BFSState(current.Col.leftNeighbor, current.Depth);
                if (!visited.Contains(next))
                {
                    visited.Add(next);
                    parent[next] = current;
                    queue.Enqueue(next);
                }
            }

            // Lateral roll to right neighbor
            if (current.Col.rightNeighbor != null && current.Col.rightNeighbor.HasDepartedAtIndex(current.Depth))
            {
                var next = new BFSState(current.Col.rightNeighbor, current.Depth);
                if (!visited.Contains(next))
                {
                    visited.Add(next);
                    parent[next] = current;
                    queue.Enqueue(next);
                }
            }
        }

        if (!found) return false;

        // Reconstruct path from terminal back to start (start excluded — marble is already there)
        var path = new List<BFSState>();
        var curr = terminalState;
        while (curr != startState)
        {
            path.Add(curr);
            if (!parent.TryGetValue(curr, out curr))
            {
                // Should never happen when BFS is correct, but guards against any
                // residual equality edge-cases in the build environment.
                Debug.LogWarning("[MarbleColumn] BFS path reconstruction lost its trail — aborting.");
                return false;
            }
        }
        path.Reverse();

        // Build world-space waypoints: one per step in the reconstructed path
        preSwerveWaypoints = new List<Vector3>();
        foreach (var state in path)
            preSwerveWaypoints.Add(state.Col.GetSlotWorldPosition(state.Depth));

        // If the terminal is at depth > 0, append the column's spawn so the marble
        // rolls all the way forward before the swerve begins.
        if (terminalState.Depth > 0)
            preSwerveWaypoints.Add(terminalState.Col.transform.position);

        spawnPoint = terminalState.Col.transform.position;
        return true;
    }

    /// <summary>
    /// Called by a Marble after it has arrived at the tray.
    /// Records the departure and refreshes colliders on every column reachable from
    /// this one so that marbles routing through multiple columns are correctly unlocked.
    /// </summary>
    public void OnMarbleLeft(Marble marble)
    {
        int idx = marbles.IndexOf(marble);
        if (idx >= 0)
            departedIndices.Add(idx);

        // Propagate to ALL connected columns, not just immediate neighbors,
        // because a departure here can unlock marbles multiple hops away.
        var toRefresh = new HashSet<MarbleColumn>();
        GatherConnectedColumns(toRefresh);
        foreach (var col in toRefresh)
            col.RefreshColliders();
    }

    /// <summary>
    /// Marks the marble as departed after a short delay, then refreshes colliders.
    /// The delay gives the departing marble time to clear its slot visually,
    /// preventing the next marble from clipping through it.
    /// </summary>
    public void OnMarbleLeftDelayed(Marble marble, float delay)
    {
        StartCoroutine(OnMarbleLeftCoroutine(marble, delay));
    }

    private IEnumerator OnMarbleLeftCoroutine(Marble marble, float delay)
    {
        yield return new WaitForSeconds(delay);

        int idx = marbles.IndexOf(marble);
        if (idx >= 0)
            departedIndices.Add(idx);

        var toRefresh = new HashSet<MarbleColumn>();
        GatherConnectedColumns(toRefresh);
        foreach (var col in toRefresh)
            col.RefreshColliders();
    }

    /// <summary> Unlocks marbles once the intro camera pan has finished. </summary>
    private void OnIntroPanComplete()
    {
        RefreshColliders();
    }

    /// <summary>Called by MarbleBoardGenerator to wire up neighbors automatically.</summary>
    public void SetNeighbors(MarbleColumn left, MarbleColumn right)
    {
        leftNeighbor  = left;
        rightNeighbor = right;
    }
    #endregion

    #region Public Helpers
    /// <summary>
    /// Explicit BFS state struct with hand-written equality and hash code.
    /// Value tuples (col, depth) used as Dictionary/HashSet keys are unreliable
    /// in IL2CPP / AOT-transpiled builds (e.g. Luna Playworks bridge.js) because
    /// the compiler-generated EqualityComparer may not be resolved at runtime.
    /// This struct avoids that by implementing IEquatable&lt;T&gt; directly.
    /// </summary>
    private readonly struct BFSState : System.IEquatable<BFSState>
    {
        public readonly MarbleColumn Col;
        public readonly int          Depth;

        public BFSState(MarbleColumn col, int depth) { Col = col; Depth = depth; }

        public bool Equals(BFSState other) =>
            ReferenceEquals(Col, other.Col) && Depth == other.Depth;

        public override bool Equals(object obj) => obj is BFSState s && Equals(s);

        public override int GetHashCode()
        {
            unchecked
            {
                // Use identity hash (avoids any virtual GetHashCode override issues on MonoBehaviour)
                int colHash = Col != null
                    ? System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(Col)
                    : 0;
                return (colHash * 397) ^ Depth;
            }
        }

        public static bool operator ==(BFSState a, BFSState b) => a.Equals(b);
        public static bool operator !=(BFSState a, BFSState b) => !a.Equals(b);
    }

    /// <summary>
    /// Recursively collects this column and all columns reachable via left/right neighbor links.
    /// </summary>
    private void GatherConnectedColumns(HashSet<MarbleColumn> result)
    {
        if (!result.Add(this)) return; // already visited
        leftNeighbor?.GatherConnectedColumns(result);
        rightNeighbor?.GatherConnectedColumns(result);
    }

    /// <summary>
    /// Evaluates every present, non-moving marble and enables its SphereCollider when:
    ///   • it is the direct front of this column, OR
    ///   • TryGetMovementPath finds a valid route via advancement + lateral columns.
    /// In-transit marbles (IsMoving) are skipped so a mid-animation collider is never
    /// re-enabled by a neighbor departure event.
    /// </summary>
    private void LockAllMarbles()
    {
        for (int i = 0; i < marbles.Count; i++)
        {
            if (departedIndices.Contains(i)) continue;
            marbles[i].SetInteractable(false);
            marbles[i].DisableCollider();
        }
    }

    private void RefreshColliders()
    {
        int frontIdx = FrontIndex;

        for (int i = 0; i < marbles.Count; i++)
        {
            if (departedIndices.Contains(i)) continue;
            if (marbles[i].IsMoving)          continue;

            bool isDirectFront = (i == frontIdx);
            bool hasPath       = isDirectFront || TryGetMovementPath(i, out _, out _);

            // Always keep the collider enabled so OnMouseDown fires for every marble.
            // Non-interactable marbles show the Wrong prompt instead of moving.
            marbles[i].EnsureColliderEnabled();
            marbles[i].SetInteractable(hasPath);
        }
    }
    #endregion
}
