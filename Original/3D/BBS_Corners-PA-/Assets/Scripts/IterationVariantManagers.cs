using DG.Tweening;
using TMPro;
using UnityEngine;

[RequireComponent(typeof(CTAManager))]
public class IterationVariantManagers : MonoBehaviour
{
    #region Enums
    public enum VariantType
    {
        Var0,
    }

    public enum IterationType
    {
        FourClicks,
        ThirtySeconds,
        Full,
    }
    #endregion

    #region Variables
    public static IterationVariantManagers Instance;

    [Header("Iteration")]
    [LunaPlaygroundField("Iteration Type", 2, "Iteration Settings", false, "Iteration")]
    [SerializeField] public IterationType ActiveIterationType;
    [SerializeField] private TMP_Text[] clickTexts;
    [SerializeField] private TMP_Text[] timerTexts;

    [Header("Variant")]
    [LunaPlaygroundField("Variant Type", 0, "Variant Settings", false, "Variant")]
    [SerializeField] public VariantType ActiveVariantType;
    [SerializeField] private GameObject[] variants;

    [Header("End Card")]
    [SerializeField] private CanvasGroup[] endCards;
    [SerializeField] private float endCardAnimationDuration = 1.0f;
    [SerializeField] private int scoreTarget = 14;

    private const int FourClickLimit = 4;
    private const float ThirtySecondLimit = 30f;

    private bool isApplied;
    private bool isRunning;
    private bool isClickLimited;
    private bool isTimeLimited;
    private bool redirectsBeforeEndCard;
    private bool isEndCardShown;
    private int targetClicks;
    private int currentClicks;
    private float timeLeft;
    #endregion

    #region Private Methods
    private void Awake()
    {
        Instance = this;
        isEndCardShown = false;
        foreach (var card in endCards)
        {
            card.alpha = 0f; card.gameObject.SetActive(false);
        }
    }

    private void Start()
    {
        AudioManager.Instance.SetMusicVolume(0.25f);
        ApplyIterationAndVariantMode();
    }

    private void SetupVariant(int index)
    {
        for (int i = 0; i < variants.Length; i++)
        {
            if (i == index) variants[i].SetActive(true);
            else variants[i].SetActive(false);
        }
    }
    #endregion

    #region Public API
    public void ApplyIterationAndVariantMode()
    {
        if (isApplied) return;
        switch (ActiveVariantType)
        {
            case VariantType.Var0:
                SetupVariant(0);
                break;
        }
        switch (ActiveIterationType)
        {
            case IterationType.FourClicks:
                ConfigureClickLimit(FourClickLimit, true);
                break;
            case IterationType.ThirtySeconds:
                ConfigureTimeLimit(ThirtySecondLimit, true);
                break;
            case IterationType.Full:
                ConfigureFull();
                break;
            default:
                ConfigureFull();
                break;
        }
        ScoreManager.Instance.Initialize(scoreTarget);
        isApplied = true;
    }

    public void StartIteration()
    {
        ApplyIterationAndVariantMode();
        if (isEndCardShown) return;
        isRunning = true;
    }

    public void RegisterClick()
    {
        if (!isRunning || isEndCardShown || !isClickLimited) return;

        currentClicks++;
        UpdateClickTexts(Mathf.Max(0, targetClicks - currentClicks));

        if (currentClicks >= targetClicks)
            ShowEndCard(false);
    }

    public void ShowEndCard(bool isWin = false)
    {
        if (isEndCardShown) return;
        isEndCardShown = true;
        isRunning = false;

        if (isWin && !ControlManager.Instance.IsGameLocked) AudioManager.Instance.PlaySFX("Success");
        ControlManager.Instance.IsGameLocked = true;
        ControlManager.Instance.ForceRelease();
        AudioManager.Instance.SetMusicVolume(0.1f);
        Luna.Unity.Analytics.LogEvent("score_achieved", ScoreManager.Instance.GetScore());
        Luna.Unity.Analytics.LogEvent(isWin
            ? Luna.Unity.Analytics.EventType.LevelWon
            : Luna.Unity.Analytics.EventType.LevelFailed);
        Luna.Unity.Analytics.LogEvent(Luna.Unity.Analytics.EventType.EndCardShown);
        if (redirectsBeforeEndCard) CTAManager.Instance.CTAClick();

        foreach (var card in endCards)
        {
            card.gameObject.SetActive(true);
            card.DOFade(1.0f, endCardAnimationDuration).SetEase(Ease.OutQuad).OnComplete(() =>
            {
                card.interactable = true;
                card.blocksRaycasts = true;
            });
        }
        DOVirtual.DelayedCall(endCardAnimationDuration, () => CTAManager.Instance.EnableCTA());
    }

    public bool CanShowEndCardOnLastBricks()
    {
        return false;
    }
    #endregion

    #region Iteration Logic
    private void Update()
    {
        if (!isRunning || isEndCardShown || !isTimeLimited) return;

        timeLeft -= Time.deltaTime;
        UpdateTimerTexts(Mathf.CeilToInt(Mathf.Max(0f, timeLeft)));

        if (timeLeft <= 0f)
            ShowEndCard(false);
    }

    private void ConfigureClickLimit(int clicks, bool autoRedirect)
    {
        isClickLimited = true;
        isTimeLimited = false;
        redirectsBeforeEndCard = autoRedirect;
        targetClicks = clicks;
        currentClicks = 0;
        timeLeft = 0f;
        UpdateClickTexts(targetClicks);
        UpdateTimerTexts(string.Empty);
    }

    private void ConfigureTimeLimit(float seconds, bool autoRedirect)
    {
        isClickLimited = false;
        isTimeLimited = true;
        redirectsBeforeEndCard = autoRedirect;
        targetClicks = 0;
        currentClicks = 0;
        timeLeft = seconds;
        UpdateClickTexts(string.Empty);
        UpdateTimerTexts(Mathf.CeilToInt(timeLeft));
    }

    private void ConfigureFull()
    {
        isClickLimited = false;
        isTimeLimited = false;
        redirectsBeforeEndCard = false;
        targetClicks = 0;
        currentClicks = 0;
        timeLeft = 0f;
        UpdateClickTexts(string.Empty);
        UpdateTimerTexts(string.Empty);
    }

    private void UpdateClickTexts(int value)
    {
        UpdateClickTexts(value.ToString());
    }

    private void UpdateClickTexts(string value)
    {
        if (clickTexts == null) return;
        foreach (var text in clickTexts)
        {
            if (text != null)
                text.text = value;
        }
    }

    private void UpdateTimerTexts(int value)
    {
        UpdateTimerTexts(value.ToString());
    }

    private void UpdateTimerTexts(string value)
    {
        if (timerTexts == null) return;
        foreach (var text in timerTexts)
        {
            if (text != null)
                text.text = value;
        }
    }
    #endregion
}
