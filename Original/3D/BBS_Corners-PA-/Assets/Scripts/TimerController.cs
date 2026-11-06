using UnityEngine;

public class TimerController : MonoBehaviour
{
    public static TimerController Instance;

    [HideInInspector] public bool IsRunning;

    private void Awake()
    {
        Instance = this;
        IsRunning = false;
    }

    public void Initialize(float seconds)
    {
    }
}
