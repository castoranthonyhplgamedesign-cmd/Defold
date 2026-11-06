using DG.Tweening;
using UnityEngine;

[RequireComponent(typeof(CTAManager))]
public class ControlManager : MonoBehaviour
{
    #region Variables
    [Header("QA Defensive Measures")]
    public static ControlManager Instance;
    [SerializeField] private LayerMask controlLayer;
    [SerializeField] private GameObject[] deactivate;
    [SerializeField] private GameObject[] activate;
    [HideInInspector] public bool IsGameLocked = false;
    [HideInInspector] public bool IsHolding = false;
    private GameObject selectedGameObject = null;
    private bool isStarted = false;
    #endregion

    #region Private Methods
    private void Awake()
    {
        Instance = this;
        IsGameLocked = false;
        selectedGameObject = null;
    }

    private void Update()
    {
        if (IsGameLocked) return;
        if (Input.GetMouseButtonDown(0))
        {
            AudioManager.Instance.PlaySFX("Click");
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit;
            if (Physics.Raycast(ray, out hit, 200f, controlLayer))
            {
                if (hit.collider != null && !selectedGameObject)
                {
                    Brick brick = hit.collider.GetComponentInParent<Brick>();
                    if (brick == null) return;

                    ControllersManagers();
                    if (IsGameLocked) return;

                    selectedGameObject = hit.collider.gameObject;
                    IsHolding = true;
                    brick.Drag();
                }
            }
        }
        if (Input.GetMouseButtonUp(0))
        {
            if (selectedGameObject)
            {
                if (selectedGameObject.GetComponentInParent<Brick>())
                {
                    GameManager.Instance.StartHint();
                    selectedGameObject.GetComponentInParent<Brick>().Drop();
                    //CameraManager.Instance.Shake(0.1f, 0.1f);
                    BoardManager.Instance.CheckIfLastBricks();
                }
                selectedGameObject = null;
                IsHolding = false;
            }
        }
    }

    private void ControllersManagers()
    {
        IterationVariantManagers.Instance.ApplyIterationAndVariantMode();
        IterationVariantManagers.Instance.StartIteration();
        IterationVariantManagers.Instance.RegisterClick();
        if (IsGameLocked) return;
        ScoreManager.Instance.AddScore(0);
        AudioManager.Instance.PlayMusic("BgMusic");
        GameManager.Instance.StopHint();
        if (!isStarted)
        {
            Luna.Unity.Analytics.LogEvent(Luna.Unity.Analytics.EventType.LevelStart);
            foreach (var off in deactivate)
                off.SetActive(false);
            foreach (var on in activate)
                on.SetActive(true);
            isStarted = true;
        }
    }
    #endregion

    #region Public API
    public void ForceRelease()
    {
        if (selectedGameObject && IsGameLocked)
        {
            DOVirtual.DelayedCall(0.1f, () =>
            {
                if (selectedGameObject)
                {
                     if (selectedGameObject.GetComponentInParent<Brick>())
                    {
                        selectedGameObject.GetComponentInParent<Brick>().Drop();
                    }
                }
                selectedGameObject = null;
                IsHolding = false;
                GameManager.Instance.StartHint();
            });
        }
        if (selectedGameObject && !IsGameLocked)
        {
            selectedGameObject = null;
            IsHolding = false;
            GameManager.Instance.StartHint();
        }
    }
    #endregion
}
