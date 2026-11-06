using DG.Tweening;
using System.Collections.Generic;
using UnityEngine;

#region Enums
public enum BrickColor
{
    Red,
    Green,
    Blue,
    Yellow,
    Orange,
    Purple,
    Pink,
    Black,
    White
}
#endregion

[RequireComponent(typeof(Rigidbody))]
public class Brick : MonoBehaviour
{
    #region Variables
    public BrickColor BrickColor;
    [SerializeField] private Material[] colorMaterials;

    [Header("Movement")]
    [SerializeField] private LayerMask blockingLayers;
    [SerializeField] private LayerMask gateBlockingLayers;
    [SerializeField] private int blockCheckCells = 1;
    [SerializeField] private float followSpeed = 32f;
    [SerializeField] private float maxDragStep = 0.55f;
    [SerializeField] private float snapDuration = 0.09f;
    [SerializeField] private float snapBackDuration = 0.08f;
    private Rigidbody rb;
    private Camera cam;
    private bool isDragging;
    private bool isAccepted = false;
    private Vector3 dragOffset;
    private Vector3 originalPosition;
    private Tween activeTween;
    private List<GridSlot> occupiedSlots = new List<GridSlot>();
    private readonly List<GridSlot> releasedSlots = new List<GridSlot>();
    private BrickCell[] cells;

    [Header("Visual")]
    [SerializeField] private MeshRenderer brickMesh;
    [SerializeField] private GameObject highlight;
    private Vector3 meshOriginalLocalPos;
    private Tween meshTween;
    private float liftAmount = 1.0f;
    private float liftDuration = 0.12f;
    #endregion

    #region Private Methods
    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        cam = Camera.main;
        cells = GetComponentsInChildren<BrickCell>(true);
        foreach (var cell in cells)
        {
            Vector3 local = cell.transform.localPosition;
            cell.localGridPosition = new Vector2Int(
                Mathf.RoundToInt(local.x),
                Mathf.RoundToInt(local.z)
            );
        }
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        rb.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
        meshOriginalLocalPos = brickMesh.transform.localPosition;
        ApplyColorMaterial();
        SetDraggingState(false);
        isAccepted = false;
    }

    private void FixedUpdate()
    {
        if (!isDragging) return;
        Dragging();
        CheckForGateWhileDragging();
    }
    #endregion

    #region Properties
    private Vector3 GetMouseWorld()
    {
        Ray ray = cam.ScreenPointToRay(Input.mousePosition);
        Plane plane = new Plane(Vector3.up, Vector3.zero);
        if (plane.Raycast(ray, out float dist)) return ray.GetPoint(dist);
        return transform.position;
    }
    #endregion

    #region Private Helpers
    private void Dragging()
    {
        Vector3 target = GetMouseWorld() + dragOffset;
        Vector3 delta = target - rb.position;
        delta.y = 0f;
        float maxStep = Mathf.Min(followSpeed * Time.fixedDeltaTime, maxDragStep);
        if (delta.sqrMagnitude < 0.0001f)
            return;
        if (delta.magnitude > maxStep)
            delta = delta.normalized * maxStep;
        Vector3 move = Vector3.zero;
        if (!IsBlocked(delta))
        {
            move = delta;
        }
        else
        {
            Vector3 moveX = new Vector3(delta.x, 0f, 0f);
            Vector3 moveZ = new Vector3(0f, 0f, delta.z);
            bool xFirst = Mathf.Abs(delta.x) >= Mathf.Abs(delta.z);
            Vector3 primary = xFirst ? moveX : moveZ;
            Vector3 secondary = xFirst ? moveZ : moveX;
            if (!IsBlocked(primary)) move = primary;
            else if (!IsBlocked(secondary)) move = secondary;
        }
        rb.MovePosition(rb.position + move);
    }

    private void CheckForGateWhileDragging()
    {
        foreach (var gate in Gate.allGates)
        {
            if (gate.CanAccept(this) && !isAccepted)
            {
                ControlManager.Instance.ForceRelease();
                gate.Absorb(this);
                isAccepted = true;
                ScoreManager.Instance.AddScore(1);
                break;
            }
        }
    }

    private void TrySnap()
    {
        List<GridSlot> targetSlots = new List<GridSlot>();
        foreach (var cell in cells)
        {
            GridSlot slot = BoardManager.Instance.GetClosestSlot(cell.transform.position);
            if (slot == null || (slot.IsOccupied && slot.occupyingBrick != this))
            {
                SnapBack();
                return;
            }
            if (targetSlots.Contains(slot))
            {
                SnapBack();
                return;
            }
            targetSlots.Add(slot);
        }
        SnapToSlots(targetSlots);
    }

    private void SnapToSlots(List<GridSlot> slots)
    {
        KillTween();
        Vector3 targetPos = slots[0].WorldPosition;
        activeTween = transform.DOMove(targetPos, snapDuration).SetEase(Ease.OutCubic)
            .OnComplete(() =>
            {
                foreach (var slot in slots) slot.SetOccupying(this);
                occupiedSlots = slots;
                releasedSlots.Clear();
            });
    }

    private void SnapBack()
    {
        KillTween();
        activeTween = transform.DOMove(originalPosition, snapBackDuration).SetEase(Ease.OutQuad)
            .OnComplete(RestoreReleasedSlots);
    }

    private void ClearSlots()
    {
        foreach (var slot in occupiedSlots) slot.Clear();
        occupiedSlots.Clear();
    }

    private void CaptureReleasedSlots()
    {
        releasedSlots.Clear();
        for (int i = 0; i < occupiedSlots.Count; i++)
        {
            if (occupiedSlots[i] != null)
                releasedSlots.Add(occupiedSlots[i]);
        }
    }

    private void RestoreReleasedSlots()
    {
        occupiedSlots.Clear();
        for (int i = 0; i < releasedSlots.Count; i++)
        {
            GridSlot slot = releasedSlots[i];
            if (slot == null) continue;
            if (slot.IsOccupied && slot.occupyingBrick != this) continue;
            slot.SetOccupying(this);
            occupiedSlots.Add(slot);
        }
        releasedSlots.Clear();
    }

    private void KillTween()
    {
        if (activeTween != null && activeTween.IsActive()) activeTween.Kill();
    }

    private void SetDraggingState(bool dragging)
    {
        if (dragging)
        {
            rb.interpolation = RigidbodyInterpolation.None;
            rb.constraints =
                RigidbodyConstraints.FreezePositionY | RigidbodyConstraints.FreezeRotationX |
                RigidbodyConstraints.FreezeRotationY | RigidbodyConstraints.FreezeRotationZ;
        }
        else
        {
            rb.velocity = Vector3.zero;
            rb.interpolation = RigidbodyInterpolation.Interpolate;
            rb.constraints =
                RigidbodyConstraints.FreezePositionX | RigidbodyConstraints.FreezePositionZ |
                RigidbodyConstraints.FreezePositionY | RigidbodyConstraints.FreezeRotationX |
                RigidbodyConstraints.FreezeRotationY | RigidbodyConstraints.FreezeRotationZ;
        }
    }

    private void ApplyColorMaterial()
    {
        int index = (int)BrickColor;
        if (brickMesh == null || colorMaterials == null || index < 0 || index >= colorMaterials.Length) return;
        if (colorMaterials[index] != null)
            brickMesh.sharedMaterial = colorMaterials[index];
    }

    private bool IsBlocked(Vector3 move)
    {
        if (move == Vector3.zero) return false;
        foreach (var cell in cells)
        {
            if (cell.IsBlocked(move, blockingLayers, transform)) return true;
        }
        return false;
    }

    private void RaiseMesh()
    {
        if (brickMesh == null) return;
        if (highlight) highlight.SetActive(true);
        meshTween?.Kill();
        meshTween = brickMesh.transform.DOLocalMoveY(meshOriginalLocalPos.y + liftAmount, liftDuration).SetEase(Ease.OutCubic);
    }

    private void ResetMeshPosition()
    {
        if (brickMesh == null) return;
        if (highlight) highlight.SetActive(false);
        meshTween?.Kill();
        meshTween = brickMesh.transform.DOLocalMoveY(meshOriginalLocalPos.y, liftDuration).SetEase(Ease.OutCubic);
    }
    #endregion

    #region Public API
    public void Drag()
    {
        originalPosition = transform.position;
        dragOffset = transform.position - GetMouseWorld();
        isDragging = true;
        RaiseMesh();
        SetDraggingState(true);
        CaptureReleasedSlots();
        ClearSlots(); KillTween();
        AudioManager.Instance.PlaySFX("Drag");
        Gate.StartBounceMatchingGates(BrickColor);
    }

    public void Drop()
    {
        isDragging = false;
        ResetMeshPosition();
        SetDraggingState(false);
        TrySnap();
        AudioManager.Instance.PlaySFX("Drop");
        Gate.StopBounceMatchingGates(BrickColor);
    }

    public List<GridSlot> GetOccupiedSlots()
    {
        return occupiedSlots;
    }

    public void RegisterInitialSlot(GridSlot slot)
    {
        if (!occupiedSlots.Contains(slot))
            occupiedSlots.Add(slot);
    }

    public void DisablePhysics()
    {
        ClearSlots();
        rb.isKinematic = true;
        rb.detectCollisions = false;
    }

    public bool IsBlockedInDirection(Vector3 direction)
    {
        direction.y = 0f;
        if (direction.sqrMagnitude < 0.0001f) return false;
        Vector3 unit = direction.normalized;
        int distance = Mathf.Max(1, blockCheckCells);
        for (int i = 0; i < cells.Length; i++)
        {
            for (int d = 1; d <= distance; d++)
            {
                if (cells[i].IsNeighborBlocked(unit * d, gateBlockingLayers, transform)) return true;
            }
        }
        return false;
    }
    #endregion

#if UNITY_EDITOR
    private void OnValidate()
    {
        ApplyColorMaterial();
    }
#endif
}
