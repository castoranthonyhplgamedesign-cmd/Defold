using UnityEngine;

public class ClickCounter : MonoBehaviour
{
    public static ClickCounter Instance;

    private void Awake()
    {
        Instance = this;
    }

    public void Initialize(int clicks)
    {
    }

    public void RegisterClick()
    {
        if (IterationVariantManagers.Instance != null)
            IterationVariantManagers.Instance.RegisterClick();
    }
}
