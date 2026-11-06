using UnityEngine;

[RequireComponent(typeof(CTAManager))]
public class ScoreManager : MonoBehaviour
{
    #region Variables
    public static ScoreManager Instance;

    private int totalScore = 0;
    private int score = 0;
    #endregion

    #region Private Methods
    private void Awake()
    {
        Instance = this;
        score = 0;
    }
    #endregion

    #region Public API
    public void Initialize(int TotalScore)
    {
        totalScore = TotalScore;
    }

    public void AddScore(int amount)
    {
        score += amount;
        if (score < 0) score = 0;
        if (score >= totalScore) score = totalScore;
    }

    public int GetScore() { return score; }
    #endregion
}
