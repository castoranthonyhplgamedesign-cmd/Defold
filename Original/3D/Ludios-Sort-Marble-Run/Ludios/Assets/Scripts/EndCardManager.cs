using System.Collections.Generic;
using DG.Tweening;
using UnityEngine;

public class EndCardManager : MonoBehaviour
{
    #region Variables
    public static EndCardManager Instance;

    [Header("Canvas Groups")]
    [Tooltip("Main UI Canvas Group")]
    [SerializeField] private CanvasGroup uiCanvasGroup;

    [Tooltip("Background Canvas Group")]
    [SerializeField] private CanvasGroup bgCanvasGroup;

    [Header("Play Button")]
    [Tooltip("RectTransform of the Play Button Image")]
    [SerializeField] private RectTransform playButtonRect;

    [Header("Rotating Element")]
    [Tooltip("RectTransform that will rotate infinitely after fade-in")]
    [SerializeField] private RectTransform rotatingRect;

    [Header("Fade Settings")]
    [Tooltip("Duration of the fade-in animation")]
    [SerializeField] private float fadeDuration = 0.5f;
    [Tooltip("Ease type for fade animation")]
    [SerializeField] private Ease fadeEase = Ease.OutQuad;

    [Header("Scale Settings")]
    [Tooltip("Target scale multiplier for punch effect")]
    [SerializeField] private float scaleMultiplier = 1.1f;

    [Tooltip("Duration of one scale loop")]
    [SerializeField] private float scaleDuration = 0.6f;

    [Tooltip("Ease type for scale animation")]
    [SerializeField] private Ease scaleEase = Ease.InOutSine;

    [Header("Rotation Settings")]
    [Tooltip("Degrees to rotate per loop (usually 360)")]
    [SerializeField] private float rotationAmount = 360f;

    [Tooltip("Duration of one full rotation")]
    [SerializeField] private float rotationDuration = 2f;

    [Tooltip("Ease type for rotation animation")]
    [SerializeField] private Ease rotationEase = Ease.Linear;

    [SerializeField] private List<GameObject> turnOff;

    private Tween scaleTween;
    private Tween rotationTween;
    #endregion


    #region Unity Methods
    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;

        InitializeCanvas();
    }
    #endregion

    #region Initialization
    private void InitializeCanvas()
    {
        uiCanvasGroup.gameObject.SetActive(false);
        bgCanvasGroup.gameObject.SetActive(false);

        uiCanvasGroup.alpha = 0f;
        bgCanvasGroup.alpha = 0f;

        uiCanvasGroup.interactable = false;
        uiCanvasGroup.blocksRaycasts = false;

        bgCanvasGroup.interactable = false;
        bgCanvasGroup.blocksRaycasts = false;
    }
    #endregion


    #region Public Methods
    public void FadeInEndCard()
    {
        uiCanvasGroup.gameObject.SetActive(true);
        bgCanvasGroup.gameObject.SetActive(true);

        Sequence fadeSequence = DOTween.Sequence();

        fadeSequence.AppendCallback(() => CTAManager.Instance.CTAClick());
        fadeSequence
            .Join(uiCanvasGroup.DOFade(1f, fadeDuration).SetEase(fadeEase))
            .Join(bgCanvasGroup.DOFade(1f, fadeDuration).SetEase(fadeEase))
            .OnComplete(() =>
            {
                DisableTurnOffObjects();
                EnableInteraction();
                StartPlayButtonLoop();
                StartRotationLoop();
            });
    }
    #endregion

    #region Turn Off Objects
    /// <summary> Deactivates all GameObjects in the turnOff list. </summary>
    private void DisableTurnOffObjects()
    {
        for (int i = 0; i < turnOff.Count; i++)
        {
            if (turnOff[i] != null)
                turnOff[i].SetActive(false);
        }
    }
    #endregion

    #region Interaction
    private void EnableInteraction()
    {
        uiCanvasGroup.interactable = true;
        uiCanvasGroup.blocksRaycasts = true;

        bgCanvasGroup.interactable = true;
        bgCanvasGroup.blocksRaycasts = true;
    }
    #endregion

    #region Play Button Animation
    private void StartPlayButtonLoop()
    {
        if (playButtonRect == null)
            return;

        playButtonRect.localScale = Vector3.one;

        scaleTween?.Kill();

        scaleTween = playButtonRect
            .DOScale(Vector3.one * scaleMultiplier, scaleDuration)
            .SetEase(scaleEase)
            .SetLoops(-1, LoopType.Yoyo);
    }

    public void StopPlayButtonLoop()
    {
        scaleTween?.Kill();
        playButtonRect.localScale = Vector3.one;
    }
    #endregion

    #region Rotation Animation
    /// <summary> Starts an infinite DOTween rotation loop on rotatingRect. </summary>
    private void StartRotationLoop()
    {
        if (rotatingRect == null)
            return;

        rotationTween?.Kill();

        rotationTween = rotatingRect
            .DORotate(new Vector3(0f, 0f, rotationAmount), rotationDuration, RotateMode.FastBeyond360)
            .SetEase(rotationEase)
            .SetLoops(-1, LoopType.Incremental);
    }

    /// <summary> Stops the rotation tween and resets rotation. </summary>
    public void StopRotationLoop()
    {
        rotationTween?.Kill();
        rotatingRect.localRotation = Quaternion.identity;
    }
    #endregion
}
