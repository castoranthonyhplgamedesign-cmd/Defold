using UnityEngine;
using UnityEngine.UI;
using DG.Tweening;
using TMPro;

[RequireComponent(typeof(CTAManager))]
public class ScoreManager : MonoBehaviour
{
    #region Variables
    public static ScoreManager Instance;

    [Header("UI")]
    [SerializeField] private Image fillBar;
    [SerializeField] private Image fillImage;
    [SerializeField] private TMP_Text[] scoreTexts;

    [Header("Starting Values")]
    [Range(0f, 1f)]
    [SerializeField] private float startingFillPercent = 0f;

    private int totalScore = 0;
    private int score = 0;
    #endregion

    #region Private Methods
    private void Awake()
    {
        Instance = this;
        score = 0;
    }

    private void UpdateUIImmediate()
    {
        foreach (var scoreText in scoreTexts)
        {
            if (scoreText != null)
                scoreText.text = score.ToString();
        }
        if (fillImage != null)
        {
            float normalizedScore = (float)score / totalScore;
            float percent = startingFillPercent + (normalizedScore * (1f - startingFillPercent));
            fillImage.fillAmount = percent;
        }
    }
    #endregion

    #region Public API
    public void Initialize(int TotalScore)
    {
        totalScore = TotalScore;
        UpdateUIImmediate();
    }

    public void AddScore(int amount)
    {
        int previousScore = score;
        score += amount;
        if (score < 0) score = 0;
        if (score >= totalScore) score = totalScore;
        if (amount <= 0) return;

        float duration = 0.4f;
        DOTween.To(() => previousScore, x =>
        {
            previousScore = x;

            foreach (var scoreText in scoreTexts)
            {
                if (scoreText != null)
                    scoreText.text = x.ToString();
            }
        }, score, duration).SetEase(Ease.OutCubic);

        foreach (var scoreText in scoreTexts)
        {
            if (scoreText == null) continue;

            scoreText.transform.DOKill();
            scoreText.transform.localScale = Vector3.one;
            scoreText.transform
                .DOPunchScale(Vector3.one * 0.3f, 0.3f, 10, 1);
        }
        if (fillBar != null)
        {
            fillBar.transform.DOKill();
            Vector3 originalScale = fillBar.transform.localScale;
            fillBar.transform.localScale = originalScale;
            fillBar.transform.DOPunchScale(originalScale * 0.2f, 0.3f, 10, 1);
        }
        if (fillImage != null)
        {
            float normalizedScore = (float)score / totalScore;
            float targetPercent = startingFillPercent + (normalizedScore * (1f - startingFillPercent));

            fillImage.DOKill();
            fillImage
                .DOFillAmount(targetPercent, duration)
                .SetEase(Ease.OutCubic);
        }
    }

    public int GetScore() { return score; }
    #endregion
}
