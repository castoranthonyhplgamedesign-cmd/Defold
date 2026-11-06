using UnityEngine;

/// <summary>
/// Stores the ordered Transform waypoints for the ramp's left and right rail paths.
/// Attach this MonoBehaviour to any GameObject in the scene (e.g. "RampWaypoints"),
/// then drag each waypoint Transform into the Inspector arrays in order — from the
/// point where marbles exit the tray all the way to the bottom of the ramp.
///
/// Slot-to-rail convention (matches Tray.slotPoints order):
///   slotPoints[0] = left  marble  → left  rail
///   slotPoints[1] = middle marble → randomly left OR right (50 / 50)
///   slotPoints[2] = right  marble → right rail
///
/// The MarbleAnimation component reads these positions at runtime via
/// GetLeftRailPositions() / GetRightRailPositions().
/// </summary>
public class RampWaypoints : MonoBehaviour
{
    [Header("Left Rail Path")]
    [Tooltip("Ordered waypoints along the left rail. " +
             "Start near the tray exit on the left side and end at the bottom of the ramp. " +
             "Add at least 4 points for a smooth CatmullRom curve.")]
    public Transform[] leftRailWaypoints;

    [Header("Right Rail Path")]
    [Tooltip("Ordered waypoints along the right rail. " +
             "Start near the tray exit on the right side and end at the bottom of the ramp. " +
             "Add at least 4 points for a smooth CatmullRom curve.")]
    public Transform[] rightRailWaypoints;

    #region Public Accessors
    /// <summary>Returns the world-space positions for the left rail path.</summary>
    public Vector3[] GetLeftRailPositions()  => ExtractPositions(leftRailWaypoints);

    /// <summary>Returns the world-space positions for the right rail path.</summary>
    public Vector3[] GetRightRailPositions() => ExtractPositions(rightRailWaypoints);
    #endregion

    #region Private Helpers
    private Vector3[] ExtractPositions(Transform[] waypoints)
    {
        if (waypoints == null || waypoints.Length == 0)
            return new Vector3[0];

        var positions = new Vector3[waypoints.Length];
        for (int i = 0; i < waypoints.Length; i++)
            positions[i] = waypoints[i] != null ? waypoints[i].position : Vector3.zero;

        return positions;
    }
    #endregion

#if UNITY_EDITOR
    // Draw the paths as gizmos so you can see them in the Scene view.
    private void OnDrawGizmos()
    {
        DrawRailGizmo(leftRailWaypoints,  Color.cyan);
        DrawRailGizmo(rightRailWaypoints, Color.green);
    }

    private static void DrawRailGizmo(Transform[] waypoints, Color color)
    {
        if (waypoints == null || waypoints.Length < 2) return;

        Gizmos.color = color;
        for (int i = 0; i < waypoints.Length; i++)
        {
            if (waypoints[i] == null) continue;

            // Draw a small sphere at each waypoint
            Gizmos.DrawSphere(waypoints[i].position, 0.12f);

            // Draw a line to the next waypoint
            if (i + 1 < waypoints.Length && waypoints[i + 1] != null)
                Gizmos.DrawLine(waypoints[i].position, waypoints[i + 1].position);
        }
    }
#endif
}
