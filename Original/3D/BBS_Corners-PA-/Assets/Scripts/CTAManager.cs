using Luna.Unity;
using UnityEngine;

[RequireComponent(typeof(ControlManager))]
[RequireComponent(typeof(IterationVariantManagers))]
[RequireComponent(typeof(ScoreManager))]

public class CTAManager : MonoBehaviour
{
    #region Variables
    public static CTAManager Instance;
    [HideInInspector] public bool IsCTA = false;
    [SerializeField] private string iosLink;
    [SerializeField] private string androidLink;
    #endregion

    #region Private Functions
    private void Awake()
    {
        Instance = this;
    }

    private void Start()
    {
        LifeCycle.GameStarted();
        IsCTA = false;
    }

    private void Update()
    {
        if (Input.GetMouseButtonDown(0) && IsCTA)
            CTAClick();
    }
    #endregion

    #region Public Functions
    public void CTAClick()
    {
        Playable.InstallFullGame(iosLink, androidLink);
        LifeCycle.GameEnded();
    }

    public void EnableCTA()
    {
        IsCTA = true;
    }

    public void CTAClickAlt()
    {
        CTAClick();
    }
    #endregion
}
