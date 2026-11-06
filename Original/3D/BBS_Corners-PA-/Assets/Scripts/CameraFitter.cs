using UnityEngine;

[RequireComponent(typeof(Camera))]
public class CameraFitter : MonoBehaviour
{
    #region Serialized Fields
    [Header("Reference Setup")]
    [Tooltip("The orthographic size the scene was authored at, for the reference aspect below.")]
    [SerializeField] private float baseOrthoSize = 13.6f;

    [Header("Reference Aspects (width / height)")]
    [Tooltip("Reference aspect for phones. 0.5625 = 9:16.")]
    [SerializeField] private float phoneReferenceAspect = 0.5625f;

    [Tooltip("Reference aspect for tablets. 0.75 = 3:4 (iPad portrait).")]
    [SerializeField] private float tabletReferenceAspect = 0.75f;

    [Tooltip("Aspect ratio threshold. Devices with aspect >= this are treated as tablets.")]
    [SerializeField] private float tabletAspectThreshold = 0.65f;

    [Header("Ortho Size Clamp (Phone)")]
    [Tooltip("Minimum orthographic size for phones.")]
    [SerializeField] private float minOrthoSize = 10f;

    [Tooltip("Maximum orthographic size for phones.")]
    [SerializeField] private float maxOrthoSize = 18f;

    [Header("Ortho Size Clamp (Tablet)")]
    [Tooltip("Minimum orthographic size for tablets.")]
    [SerializeField] private float tabletMinOrthoSize = 10f;

    [Tooltip("Maximum orthographic size for tablets.")]
    [SerializeField] private float tabletMaxOrthoSize = 18f;

    [Header("Landscape")]
    [Tooltip("When true, landscape keeps base ortho size (fit by height). When false, landscape also fits by width.")]
    [SerializeField] private bool landscapeFitByHeight = true;

    #endregion

    #region Cached References
    private Camera targetCamera;
    private int lastScreenWidth;
    private int lastScreenHeight;
    #endregion

    /// <summary> Caches the Camera component. </summary>
    private void Awake()
    {
        targetCamera = GetComponent<Camera>();
    }

    /// <summary> Applies the initial fit on scene start. </summary>
    private void Start()
    {
        ApplyFit();
    }

    /// <summary> Re-applies the fit whenever the screen resolution changes. </summary>
    private void Update()
    {
        if (Screen.width != lastScreenWidth || Screen.height != lastScreenHeight)
        {
            ApplyFit();
        }
    }

    /// <summary> Computes and applies the orthographic size for the current screen aspect. </summary>
    private void ApplyFit()
    {
        lastScreenWidth = Screen.width;
        lastScreenHeight = Screen.height;

        if (targetCamera == null) return;

        float currentAspect = (float)Screen.width / Screen.height;
        bool isPortrait = currentAspect < 1f;

        float portraitAspect = isPortrait ? currentAspect : 1f / currentAspect;
        bool isTablet = portraitAspect >= tabletAspectThreshold;
        float activeReferenceAspect = isTablet ? tabletReferenceAspect : phoneReferenceAspect;

        float newSize;

        if (isPortrait || !landscapeFitByHeight)
        {
            newSize = baseOrthoSize * (activeReferenceAspect / currentAspect);
        }
        else
        {
            newSize = baseOrthoSize;
        }

        float clampMin = isTablet ? tabletMinOrthoSize : minOrthoSize;
        float clampMax = isTablet ? tabletMaxOrthoSize : maxOrthoSize;
        newSize = Mathf.Clamp(newSize, clampMin, clampMax);

        targetCamera.orthographicSize = newSize;
    }
}
