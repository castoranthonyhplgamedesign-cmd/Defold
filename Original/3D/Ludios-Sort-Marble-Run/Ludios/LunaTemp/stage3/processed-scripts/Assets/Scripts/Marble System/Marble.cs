using System;
using DG.Tweening;
using UnityEngine;

/// <summary>
/// Represents a marble that the player can click to send it to the current tray.
/// Requires a Collider on the GameObject for OnMouseDown to work.
/// </summary>
public class Marble : MonoBehaviour
{
    #region Variables
    [Header("Marble Settings")]
    [Tooltip("The color type of this marble.")]
    public MarbleType marbleType;

    [Header("Wrong Prompt")]
    [Tooltip("Shared RectTransform (Wrong image) shown when tapping a non-interactable marble.")]
    public RectTransform wrongPromptImage;
    [Tooltip("The Canvas that contains the wrongPromptImage (used to convert world → canvas space).")]
    public Canvas wrongPromptCanvas;

    private bool isMoving;
    private bool isInTray;
    private bool isInteractable;
    private MarbleColumn column;
    private SphereCollider sphereCollider;

    /// <summary>Fired when the player clicks this marble and a tray slot is successfully reserved.</summary>
    public static event Action<Marble> OnMarbleClicked;
    #endregion

    #region Unity Methods
    private void Awake()
    {
        column = GetComponentInParent<MarbleColumn>();
        sphereCollider = GetComponent<SphereCollider>();
    }

    private void OnMouseDown()
    {
        if (isMoving)
            return;

        if (!isInteractable)
        {
            ShowWrongPrompt();
            return;
        }

        if (TryMoveToTray())
            OnMarbleClicked?.Invoke(this);
    }
    #endregion

    #region Public Properties
    /// <summary>True while this marble is animating toward the tray.</summary>
    public bool IsMoving => isMoving;

    /// <summary>True once this marble has been confirmed as placed inside a tray.</summary>
    public bool IsInTray => isInTray;

    /// <summary>True when this marble has a valid movement path and can be sent to the tray.</summary>
    public bool IsInteractable => isInteractable;
    #endregion

    #region Public Methods
    /// <summary>
    /// Tracks whether this marble can be moved. The SphereCollider stays enabled so
    /// OnMouseDown fires and shows the wrong-tap prompt when not interactable.
    /// Called by MarbleColumn whenever path availability changes.
    /// </summary>
    public void SetInteractable(bool interactable)
    {
        isInteractable = interactable;
    }

    /// <summary>Ensures the SphereCollider is enabled so OnMouseDown always fires.</summary>
    public void EnsureColliderEnabled()
    {
        if (sphereCollider != null) sphereCollider.enabled = true;
    }

    /// <summary>Disables the SphereCollider so the marble cannot be clicked at all.</summary>
    public void DisableCollider()
    {
        if (sphereCollider != null) sphereCollider.enabled = false;
    }
    #endregion

    #region Private Methods
    /// <summary>
    /// Positions the shared wrongPromptImage over this marble in screen space,
    /// then animates it scale 0 → 1 → 0.
    /// </summary>
    private void ShowWrongPrompt()
    {
        if (wrongPromptImage == null) return;

        // Convert this marble's world position to canvas-local coordinates,
        // matching the same approach used by TutorialManager for the hand UI.
        if (wrongPromptCanvas != null)
        {
            Vector3 screenPos = Camera.main.WorldToScreenPoint(transform.position);
            RectTransformUtility.ScreenPointToLocalPointInRectangle(
                (RectTransform)wrongPromptCanvas.transform,
                screenPos,
                null, // null = Screen Space Overlay — no camera needed
                out Vector2 canvasPos);
            wrongPromptImage.anchoredPosition = canvasPos;
        }

        wrongPromptImage.gameObject.SetActive(true);
        wrongPromptImage.localScale = Vector3.zero;

        Sequence seq = DOTween.Sequence();
        seq.Append(wrongPromptImage.DOScale(Vector3.one, 0.2f).SetEase(Ease.OutBack));
        seq.AppendInterval(0.1f);
        seq.Append(wrongPromptImage.DOScale(Vector3.zero, 0.15f).SetEase(Ease.InBack));
        seq.OnComplete(() => wrongPromptImage.gameObject.SetActive(false));
    }

    /// <summary>
    /// Asks the TrayManager for an available slot on the current tray and moves there.
    /// Returns true if movement was successfully started, false otherwise.
    /// </summary>
    private bool TryMoveToTray()
    {
        if (TrayManager.Instance == null)
        {
            Debug.LogWarning("No TrayManager found in the scene.");
            return false;
        }

        Tray targetTray = TrayManager.Instance.currentTray;

        Transform targetSlot = TrayManager.Instance.RequestSlotForMarble(this);

        if (targetSlot == null)
        {
            Debug.LogWarning($"No available slot for marble {marbleType}.");
            return false;
        }

        MoveToSlot(targetSlot, targetTray);
        return true;
    }

    /// <summary>
    /// Determines the best movement path and triggers the corresponding animation.
    ///
    /// Priority:
    ///   1. Direct forward movement — if this marble is the front of its column it always
    ///      rolls straight to its own spawn point then swerves to the tray (unchanged).
    ///   2. Multi-hop path — if blocked in front, the column checks whether the marble can
    ///      advance through cleared slots within its column and/or roll laterally through
    ///      one or more adjacent columns to reach another column's spawn.
    ///
    /// Assignment to the tray only happens after the animation completes.
    /// </summary>
    private void MoveToSlot(Transform targetSlot, Tray tray)
    {
        AudioManager.Instance.PlaySFX("MarbleClick");

        isMoving = true;
        if (sphereCollider != null) sphereCollider.enabled = false;

        // Mark departure immediately so adjacent marbles become clickable
        // without waiting for this marble's full animation to finish.
        // A short delay prevents the next marble from moving on the same
        // frame and clipping through this one while it clears the slot.
        if (column != null) column.OnMarbleLeftDelayed(this, 0.15f);

        int  myIndex      = column != null ? column.GetOriginalIndex(this) : 0;
        bool isDirectFront = column != null && myIndex == column.FrontIndex;

        // Only attempt a multi-hop path when this marble is NOT the direct front.
        // Direct forward movement always takes priority.
        if (!isDirectFront
            && column != null
            && column.TryGetMovementPath(myIndex, out var preSwerveWaypoints, out var pathSpawnPoint))
        {
            MarbleAnimationManager.Instance.PlayMoveToTrayViaPath(
                transform, preSwerveWaypoints, pathSpawnPoint, targetSlot,
                () =>
                {
                    transform.SetParent(tray.transform);
                    transform.position = targetSlot.position;
                    isMoving = false;
                    isInTray = true;
                    tray.ConfirmMarbleArrival(this);
                });
        }
        else
        {
            // Direct route: roll forward to this column's spawn, then swerve → drop → bounce.
            Vector3 spawnPointPosition = column != null
                ? column.transform.position
                : transform.position;

            // Only the original index-0 marble starts pre-placed at the spawn point.
            bool isAtSpawnPoint = myIndex == 0;

            MarbleAnimationManager.Instance.PlayMoveToTray(
                transform, spawnPointPosition, targetSlot, isAtSpawnPoint,
                () =>
                {
                    transform.SetParent(tray.transform);
                    transform.position = targetSlot.position;
                    isMoving = false;
                    isInTray = true;
                    tray.ConfirmMarbleArrival(this);
                });
        }
    }
    #endregion
}
