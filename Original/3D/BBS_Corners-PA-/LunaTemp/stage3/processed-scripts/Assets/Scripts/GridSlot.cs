using UnityEngine;

public class GridSlot : MonoBehaviour
{
    #region Variables
    [Header("Brick")]
    public Brick occupyingBrick;

    [Header("Detection")]
    [SerializeField] private LayerMask brickLayer;
    [SerializeField] private Vector3 checkBoxSize = new Vector3(0.9f, 0.5f, 0.9f);
    #endregion

    #region Properties
    public bool IsOccupied => occupyingBrick != null;
    public Vector3 WorldPosition => transform.position;
    #endregion

    #region Unity
    private void Start()
    {
        DetectInitialBrick();
    }
    #endregion

    #region Detection
    private void DetectInitialBrick()
    {
        Collider[] hits = Physics.OverlapBox(
            transform.position,
            checkBoxSize * 0.5f,
            Quaternion.identity,
            brickLayer,
            QueryTriggerInteraction.Ignore
        );
        for (int i = 0; i < hits.Length; i++)
        {
            BrickCell cell = hits[i].GetComponent<BrickCell>();
            if (cell != null)
            {
                Brick brick = cell.GetComponentInParent<Brick>();
                if (brick != null)
                {
                    occupyingBrick = brick;
                    brick.RegisterInitialSlot(this);
                    return;
                }
            }
        }
    }
    #endregion

    #region Public API
    public void SetOccupying(Brick brick)
    {
        occupyingBrick = brick;
    }

    public void Clear()
    {
        occupyingBrick = null;
    }
    #endregion

#if UNITY_EDITOR
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.green;
        Gizmos.DrawWireCube(transform.position, checkBoxSize);
    }
#endif
}