using System.Collections.Generic;
using DG.Tweening;
using UnityEngine;

/// <summary>
/// Manages the collection of trays in the scene and tracks which tray is currently active.
/// Marbles query this manager to find out where they should go.
/// </summary>
public class TrayManager : MonoBehaviour
{
    #region Variables
    [Header("Tray Collection")]
    [Tooltip("All trays in the scene. Order determines the sequence they become active.")]
    public List<Tray> trayCollection = new List<Tray>();

    [Header("Tray Management")]
    [Tooltip("The tray that is currently accepting marbles.")]
    public Tray currentTray;

    [Header("Tray Movement")]
    [Tooltip("The parent transform that holds all trays. Moves right when a tray is completed.")]
    public Transform trayParent;

    [Tooltip("How far the tray parent moves on the X axis per completed tray.")]
    public float moveOffset = -35f;

    [Tooltip("Duration of the slide animation in seconds.")]
    public float moveDuration = 0.5f;

    [Tooltip("Duration of the next tray sliding forward to Z = 0.")]
    public float zSlideDuration = 0.5f;

    [Tooltip("Local Z position the exiting tray slides back to before the parent moves.")]
    public float zExitTarget = -10f;

    // Singleton for easy access from Marble without tight coupling via references
    public static TrayManager Instance { get; private set; }
    #endregion

    #region Unity Methods
    private void Awake()
    {
        // Simple singleton setup
        if (Instance != null && Instance != this)
        {
            Debug.LogWarning("Multiple TrayManagers detected — destroying duplicate.");
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void OnEnable()
    {
        // Subscribe to each tray's filled event so we can advance automatically
        foreach (var tray in trayCollection)
        {
            if (tray != null)
                tray.OnTrayFilled += HandleTrayFilled;
        }
    }

    private void OnDisable()
    {
        foreach (var tray in trayCollection)
        {
            if (tray != null)
                tray.OnTrayFilled -= HandleTrayFilled;
        }
    }

    private void Start()
    {
        // Slide the first tray in rather than snapping it to active
        if (currentTray == null && trayCollection.Count > 0)
            SlideNextTrayForward(0);
    }
    #endregion

    #region Public Methods
    /// <summary>
    /// Reserves a slot on the current tray for a marble to animate towards.
    /// The marble is NOT assigned yet — that happens after the animation via Tray.ConfirmMarbleArrival.
    /// </summary>
    public Transform RequestSlotForMarble(Marble marble)
    {
        if (currentTray == null)
        {
            Debug.LogWarning("No current tray is set in TrayManager.");
            return null;
        }

        return currentTray.ReserveNextSlot();
    }

    /// <summary>
    /// Populates the tray collection from all Tray children under the given parent.
    /// Called by TrayGenerator after generating trays.
    /// </summary>
    public void PopulateTrays(Transform parent)
    {
        trayCollection.Clear();

        foreach (Transform child in parent)
        {
            Tray tray = child.GetComponent<Tray>();
            if (tray != null)
                trayCollection.Add(tray);
        }

        if (trayCollection.Count > 0)
            SlideNextTrayForward(0);

        Debug.Log($"TrayManager populated with {trayCollection.Count} trays.");
    }

    /// <summary>
    /// Clears the tray collection and resets the current tray.
    /// Called by TrayGenerator before clearing trays.
    /// </summary>
    public void ClearTrays()
    {
        trayCollection.Clear();
        currentTray = null;
        Debug.Log("TrayManager cleared.");
    }
    #endregion

    #region Private Methods
    /// <summary>
    /// Called when a tray has all its marbles arrived and destroyed.
    /// Slides the tray parent, then assigns the next tray only after the move completes.
    /// </summary>
    private void HandleTrayFilled(Tray filledTray)
    {
        Debug.Log($"Tray {filledTray.trayColor} has been filled!");

        int index = trayCollection.IndexOf(filledTray);
        int nextIndex = index + 1;

        // Prevent any marble clicks during the tray transition
        currentTray = null;

        // 1. Slide the filled tray back, then 2. slide the parent, then 3. slide the next tray in
        filledTray.transform.DOLocalMoveZ(zExitTarget, zSlideDuration)
            .SetEase(Ease.InQuad)
            .OnComplete(() =>
            {
                if (trayParent != null)
                {
                    Vector3 targetPos = trayParent.position + new Vector3(moveOffset, 0f, 0f);
                    trayParent.DOMove(targetPos, moveDuration)
                        .SetEase(Ease.OutQuad)
                        .OnComplete(() => SlideNextTrayForward(nextIndex));
                }
                else
                {
                    SlideNextTrayForward(nextIndex);
                }
            });
    }

    private void SlideNextTrayForward(int nextIndex)
    {
        if (nextIndex >= trayCollection.Count)
        {
            AdvanceToNextTray(nextIndex);
            return;
        }

        Tray nextTray = trayCollection[nextIndex];
        nextTray.transform.DOLocalMoveZ(0f, zSlideDuration)
            .SetEase(Ease.OutQuad)
            .OnComplete(() => AdvanceToNextTray(nextIndex));
    }

    private void AdvanceToNextTray(int nextIndex)
    {
        if (nextIndex < trayCollection.Count)
        {
            currentTray = trayCollection[nextIndex];
            Debug.Log($"Current tray is now {currentTray.trayColor}.");
        }
        else
        {
            currentTray = null;
            Debug.Log("All trays have been filled!");
            EndCardManager.Instance.FadeInEndCard();
        }
    }
    #endregion
}
