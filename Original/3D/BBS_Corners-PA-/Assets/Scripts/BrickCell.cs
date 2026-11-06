using UnityEngine;

[RequireComponent(typeof(Collider))]
public class BrickCell : MonoBehaviour
{
    #region Variables
    [HideInInspector] public Vector2Int localGridPosition;
    private Collider col;
    #endregion

    #region Private Methods
    private void Awake()
    {
        col = GetComponent<Collider>();
    }
    #endregion

    #region Public Methods
    public bool IsBlocked(Vector3 move, LayerMask blockingLayers, Transform root)
    {
        if (move == Vector3.zero) return false;
        Vector3 destCenter = col.bounds.center + move;
        Vector3 halfExtents = col.bounds.extents * 0.99f;
        Collider[] hits = Physics.OverlapBox(destCenter, halfExtents, Quaternion.identity, blockingLayers, QueryTriggerInteraction.Ignore);
        for (int i = 0; i < hits.Length; i++)
        {
            Collider hitCol = hits[i];
            if (hitCol == null) continue;
            if (hitCol.transform.IsChildOf(root)) continue;
            return true;
        }
        return false;
    }

    public bool IsNeighborBlocked(Vector3 step, LayerMask blockingLayers, Transform root)
    {
        if (step == Vector3.zero) return false;
        Vector3 checkPos = col.bounds.center + step;
        Vector3 halfExtents = col.bounds.extents * 0.5f;
        Collider[] hits = Physics.OverlapBox(checkPos, halfExtents, Quaternion.identity, blockingLayers, QueryTriggerInteraction.Ignore);
        for (int i = 0; i < hits.Length; i++)
        {
            Collider c = hits[i];
            if (c == null) continue;
            if (c.transform.IsChildOf(root)) continue;
            return true;
        }
        return false;
    }
    #endregion

}