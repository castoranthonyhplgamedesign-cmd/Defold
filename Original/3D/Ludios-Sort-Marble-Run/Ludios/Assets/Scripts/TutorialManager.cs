using DG.Tweening;
using UnityEngine;

/// <summary>
/// Displays a tutorial hand UI that guides the player to click the correct marble.
///
/// Flow:
///   1. Game starts  →  countdown timer begins.
///   2. Timer expires  →  hand fades in over the nearest interactable marble that
///      matches the current tray colour; hand pulses (scale yoyo) indefinitely.
///   3. Player clicks any marble  →  hand fades out immediately.
///   4. That marble arrives at the tray  →  countdown timer restarts.
///   5. If the player never interacts again, the hand fades in once more (step 2).
///
/// Requirements:
///   • Attach to a GameObject in the scene.
///   • Assign handRect, handCanvasGroup, and overlayCanvas in the Inspector.
///   • The handRect must be a direct child of the overlay Canvas (Screen Space – Overlay).
/// </summary>
public class TutorialManager : MonoBehaviour
{
    #region  Variables
    public static TutorialManager Instance { get; private set; }

    [Header("UI References")]
    [Tooltip("RectTransform of the tutorial hand image. Must be a direct child of the overlay Canvas.")]
    public RectTransform handRect;

    [Tooltip("CanvasGroup on the tutorial hand image, used for fading.")]
    public CanvasGroup handCanvasGroup;

    [Tooltip("The Screen Space – Overlay Canvas used for 3D → 2D coordinate conversion.")]
    public Canvas overlayCanvas;

    [Header("Timing")]
    [Tooltip("Seconds of player inactivity before the tutorial hand fades in.")]
    public float idleTimeout = 3f;

    [Tooltip("Duration in seconds of the fade-in / fade-out transitions.")]
    public float fadeDuration = 0.4f;

    [Header("Hand Positioning")]
    [Tooltip("Canvas-space offset so the pointer finger of the hand sprite aims at the marble centre.")]
    public Vector2 handOffset = new Vector2(-40f, 60f);

    [Header("Pulse Animation")]
    [Tooltip("Minimum scale multiplier during the idle pulse.")]
    public float pulseMinScale = 0.85f;

    [Tooltip("Maximum scale multiplier during the idle pulse.")]
    public float pulseMaxScale = 1.15f;

    [Tooltip("Seconds for one half-cycle of the pulse (small → large).")]
    public float pulseDuration = 0.6f;

    private enum TutorialState { WaitingForIntro, CountingDown, WaitingForArrival, Showing }

    private TutorialState _state;
    private float _timer;

    // While Showing  → the marble the hand is pointing at.
    // After a click  → the marble we are waiting to land.
    private Marble _targetMarble;
    #endregion

    #region Unity LifeCycle
    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void OnEnable()
    {
        Marble.OnMarbleClicked              += HandleMarbleClicked;
        Tray.OnMarbleArrived               += HandleMarbleArrived;
        MarbleIntroAnimation.OnIntroPanComplete += HandleIntroPanComplete;
    }

    private void OnDisable()
    {
        Marble.OnMarbleClicked              -= HandleMarbleClicked;
        Tray.OnMarbleArrived               -= HandleMarbleArrived;
        MarbleIntroAnimation.OnIntroPanComplete -= HandleIntroPanComplete;
    }

    private void Start()
    {
        // Start invisible; countdown begins only after the intro pan fires.
        handCanvasGroup.alpha = 0f;
        handRect.gameObject.SetActive(false);
        _state = TutorialState.WaitingForIntro;
        _timer = 0f;
    }

    private void Update()
    {
        switch (_state)
        {
            case TutorialState.CountingDown:
                _timer += Time.deltaTime;
                if (_timer >= idleTimeout)
                    TryShowTutorial();
                break;

            case TutorialState.Showing:
                if (_targetMarble != null)
                    UpdateHandPosition();
                else
                    HideHand(); // target was destroyed unexpectedly
                break;
        }
    }
    #endregion

    #region Core Logic
    private void TryShowTutorial()
    {
        Marble match = FindTargetMarble();

        if (match == null)
        {
            // No valid marble right now; retry after a short delay.
            _timer = idleTimeout - 1f;
            return;
        }

        _targetMarble = match;
        _state = TutorialState.Showing;
        ShowHand();
    }

    private void ShowHand()
    {
        handRect.gameObject.SetActive(true);
        UpdateHandPosition();

        // Kill any leftover tweens before starting new ones.
        DOTween.Kill(handCanvasGroup);
        DOTween.Kill(handRect);

        // Fade in.
        handCanvasGroup.alpha = 0f;
        handCanvasGroup.DOFade(1f, fadeDuration);

        // Infinite scale pulse (yoyo: min → max → min → …).
        handRect.localScale = Vector3.one * pulseMinScale;
        handRect.DOScale(Vector3.one * pulseMaxScale, pulseDuration)
            .SetEase(Ease.InOutSine)
            .SetLoops(-1, LoopType.Yoyo);
    }

    private void HideHand()
    {
        DOTween.Kill(handRect);
        DOTween.Kill(handCanvasGroup);

        handRect.localScale = Vector3.one;

        handCanvasGroup.DOFade(0f, fadeDuration)
            .OnComplete(() => handRect.gameObject.SetActive(false));
    }

    /// <summary>
    /// Converts the target marble's world position to canvas-local coordinates and
    /// repositions the hand each frame while it is visible.
    /// </summary>
    private void UpdateHandPosition()
    {
        Camera cam = Camera.main;
        if (cam == null || _targetMarble == null || overlayCanvas == null) return;

        Vector3 screenPos = cam.WorldToScreenPoint(_targetMarble.transform.position);

        // If the marble has somehow ended up behind the camera, hide the hand.
        if (screenPos.z < 0f)
        {
            handCanvasGroup.alpha = 0f;
            return;
        }

        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            (RectTransform)overlayCanvas.transform,
            screenPos,
            null, // null = Screen Space – Overlay (no camera needed)
            out Vector2 canvasPos);

        handRect.anchoredPosition = canvasPos + handOffset;
    }

    /// <summary>
    /// Searches all active marbles for one that is interactable (SphereCollider enabled,
    /// not currently moving) and whose colour matches the current tray.
    /// </summary>
    private Marble FindTargetMarble()
    {
        if (TrayManager.Instance == null || TrayManager.Instance.currentTray == null)
            return null;

        string trayColor = TrayManager.Instance.currentTray.trayColor.ToString();

#pragma warning disable CS0618
        foreach (Marble marble in FindObjectsOfType<Marble>())
#pragma warning restore CS0618
        {
            if (marble.IsMoving)       continue;
            if (marble.IsInTray)       continue;
            if (!marble.IsInteractable) continue;

            if (marble.marbleType.ToString() == trayColor)
                return marble;
        }

        return null;
    }
    #endregion

    #region  Event Handlers
    private void HandleIntroPanComplete()
    {
        if (_state == TutorialState.WaitingForIntro)
        {
            _state = TutorialState.CountingDown;
            _timer = 0f;
        }
    }

    private void HandleMarbleClicked(Marble marble)
    {
        _targetMarble = marble; // remember which marble to wait for

        if (_state == TutorialState.Showing)
            HideHand();
        else
        {
            // Hand wasn't visible but make sure no stale tweens are running.
            DOTween.Kill(handRect);
            DOTween.Kill(handCanvasGroup);
            handRect.gameObject.SetActive(false);
            handCanvasGroup.alpha = 0f;
            handRect.localScale = Vector3.one;
        }

        _state = TutorialState.WaitingForArrival;
    }

    private void HandleMarbleArrived(Marble marble)
    {
        // Restart the countdown only once the specific marble we were tracking lands.
        if (_state == TutorialState.WaitingForArrival && marble == _targetMarble)
        {
            _targetMarble = null;
            _state = TutorialState.CountingDown;
            _timer = 0f;
        }
    }
    #endregion
}
