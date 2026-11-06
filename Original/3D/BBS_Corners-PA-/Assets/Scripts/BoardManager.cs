    using UnityEngine;
using System.Collections.Generic;

public class BoardManager : MonoBehaviour
{
    #region Variables
    public static BoardManager Instance;
    [SerializeField, ReadOnly] private List<GridSlot> slots = new List<GridSlot>();
    [SerializeField, ReadOnly] private List<Brick> bricks = new List<Brick>();
    #endregion

    #region Private Methods
    private void Awake()
    {
        Instance = this;
        slots.AddRange(FindObjectsOfType<GridSlot>());
        bricks.AddRange(FindObjectsOfType<Brick>());
    }
    #endregion

    #region Public API
    public GridSlot GetClosestSlot(Vector3 pos)
    {
        float minDist = float.MaxValue;
        GridSlot closest = null;

        foreach (var slot in slots)
        {
            float dist = Vector3.Distance(pos, slot.WorldPosition);
            if (dist < minDist)
            {
                minDist = dist;
                closest = slot;
            }
        }

        return minDist < 1f ? closest : null;
    }

    public GridSlot GetSlotAtPosition(Vector3 worldPos)
    {
        foreach (var slot in slots)
        {
            if (Vector3.Distance(slot.WorldPosition, worldPos) < 0.1f)
                return slot;
        }

        return null;
    }

    public void CheckAllBricks()
    {
        foreach (var brick in bricks)
        {
            if (brick != null && brick.gameObject.activeInHierarchy)
            {
                return;
            }
        }
        IterationVariantManagers.Instance.ShowEndCard(true);
    }

    public void CheckIfLastBricks()
    {
        if (IterationVariantManagers.Instance != null && !IterationVariantManagers.Instance.CanShowEndCardOnLastBricks())
            return;

        int activeBricks = 0;
        foreach (var brick in bricks)
        {
            if (brick != null && brick.gameObject.activeInHierarchy)
            {
                activeBricks++;
                if (activeBricks > 4) return;
            }
        }
        IterationVariantManagers.Instance.ShowEndCard(true);
    }
    #endregion
}
