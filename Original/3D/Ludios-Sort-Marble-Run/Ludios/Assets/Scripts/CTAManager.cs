using Luna.Unity;
using UnityEngine;

public class CTAManager : MonoBehaviour
{
    public static CTAManager Instance;

    [SerializeField] private string iosLink;
    [SerializeField] private string androidLink;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void Start()
    {
        LifeCycle.GameStarted();
    }

    public void CTAClick()
    {
        Playable.InstallFullGame(iosLink, androidLink);
        LifeCycle.GameEnded();
    }
}