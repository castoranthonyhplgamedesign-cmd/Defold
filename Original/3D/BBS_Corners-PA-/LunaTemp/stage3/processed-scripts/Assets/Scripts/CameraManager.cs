using DG.Tweening;
using UnityEngine;

#region Structs
[System.Serializable]
public struct AnimationStep
{
    public Vector3 target;
    public float duration;
    public float zoom;
}

[System.Serializable]
public struct AnimationSeqStep
{
    public Vector3 target;
    public float duration;
    public float pause;
    public float zoom;
    public Ease ease;
}
#endregion

#region Enums
public enum PanAxis
{
    XY,
    XZ,
    YZ
}
#endregion

public class CameraManager : MonoBehaviour
{
    #region Variables
    public static CameraManager Instance { get; private set; }
    private Camera cam;

    [Header("Panning Settings")]
    public bool IsPan;
    public LayerMask PanLayer;
    public PanAxis PanAxis = PanAxis.XY;
    [SerializeField] private Vector3 originVector = new Vector3(0, 0, 0);
    private Vector3 panTarget;
    private Vector3 lastInputPos;
    private Vector3 mouseDownPos;
    private float panSensitivity = 5.0f;
    private float clickPanDuration = 0.3f;
    private float clickPanThreshold = 2.0f;
    private float distanceClamp = 100.0f;
    private bool isPannable;
    private bool isPanning;
    private Tween panTween;

    [Header("Zoom Settings")]
    public bool IsZoom;
    [SerializeField] private float zoomIn = 10.0f;
    [SerializeField] private float zoomOut = 60.0f;
    private float zoomSensitivity = 0.01f;
    private bool isZoomable;
    private bool isZooming;
    private Tween zoomTween;

    [Header("Shake Settings")]
    public bool IsShake;
    private float shakeTime = 0.2f;
    private float shakeIntensity = 0.5f;
    private float shakeRandomness = 90.0f;
    private int shakeVibrato = 20;
    private Tween shakeTween;

    [Header("Animation Settings")]
    public bool IsAnimation;
    [SerializeField] private AnimationStep[] animationSteps;
    private float animationDuration = 1.0f;
    private float animationZoom = 25.0f;
    private int currentAnimationIndex = 0;
    private Ease animationEase = Ease.InOutSine;
    private Tween animationTween;

    [Header("Animation Sequence Settings")]
    public bool IsAnimationSeq;
    [SerializeField] private AnimationSeqStep[] animationSeqSteps;
    private Ease animationSeqEase = Ease.InOutSine;
    private Tween animationSeqTween;
    #endregion

    #region Private Methods
    private void Awake()
    {
        Instance = this;
        cam = GetComponent<Camera>();
        panTarget = transform.position;
    }

    private void Start()
    {
        AnimateSeq();
        isPannable = true;
        isZoomable = true;
    }

    private void Update()
    {
        SmoothPan();
        HandleZoom();
    }

    private void SmoothPan()
    {
        if (!IsPan || !isPannable || isZooming) return;
        if (ControlManager.Instance.IsHolding)
        {
            isPanning = false;
            if (panTween != null && panTween.IsActive())
            {
                panTween.Kill();
                panTarget = transform.position;
            }
            return;
        }
        if (Input.GetMouseButtonDown(0))
        {
            isPanning = true;
            mouseDownPos = Input.mousePosition;
            lastInputPos = mouseDownPos;
            if (panTween != null && panTween.IsActive())
                panTween.Kill();
        }
        if (isPanning && Input.GetMouseButton(0))
        {
            Vector3 delta = Input.mousePosition - lastInputPos;
            Vector3 moveDir = GetPanDirection(new Vector2(-delta.x, -delta.y));
            Vector3 move = moveDir * panSensitivity * Time.deltaTime;
            panTarget += move;
            panTarget.x = Mathf.Clamp(panTarget.x, -distanceClamp, distanceClamp);
            panTarget.y = Mathf.Clamp(panTarget.y, -distanceClamp, distanceClamp);
            panTarget.z = Mathf.Clamp(panTarget.z, -distanceClamp, distanceClamp);
            transform.position = Vector3.Lerp(
                transform.position,
                panTarget,
                1f - Mathf.Exp(-20f * Time.deltaTime)
            );
            lastInputPos = Input.mousePosition;
        }
        if (Input.GetMouseButtonUp(0))
        {
            float totalDrag = (Input.mousePosition - mouseDownPos).magnitude;
            if (totalDrag < clickPanThreshold && !isZooming)
            {
                PanToClick(Input.mousePosition);
            }
            isPanning = false;
        }
    }

    private void PanToClick(Vector3 mousePos)
    {
        Vector3 viewport = cam.ScreenToViewportPoint(mousePos);
        Vector2 offset = new Vector2(viewport.x - 0.5f, viewport.y - 0.5f);
        float distance = offset.magnitude;
        if (distance < 0.05f) return;
        float normalized = Mathf.Clamp01(distance / 0.5f);
        float strengthFactor = Mathf.Pow(normalized, 2.5f);
        Vector2 dir = offset.normalized;
        Vector3 moveDir = GetPanDirection(dir);
        float maxClickPanDistance = 20f;
        Vector3 move = moveDir * maxClickPanDistance * strengthFactor;
        panTarget += move;
        panTarget.x = Mathf.Clamp(panTarget.x, -distanceClamp, distanceClamp);
        panTarget.y = Mathf.Clamp(panTarget.y, -distanceClamp, distanceClamp);
        panTarget.z = Mathf.Clamp(panTarget.z, -distanceClamp, distanceClamp);
        if (panTween != null && panTween.IsActive())
            panTween.Kill();
        panTween = transform
            .DOMove(panTarget, clickPanDuration)
            .SetEase(Ease.OutCubic)
            .SetUpdate(true);
    }

    private Vector3 GetPanDirection([Bridge.Ref] Vector2 input)
    {
        Vector3 right = cam.transform.right;
        Vector3 up = cam.transform.up;
        Vector3 forward = cam.transform.forward;
        Vector3 result = Vector3.zero;
        switch (PanAxis)
        {
            case PanAxis.XY:
                right.z = 0f;
                up.z = 0f;
                if (right.sqrMagnitude > 0) right.Normalize();
                if (up.sqrMagnitude > 0) up.Normalize();
                result = right * input.x + up * input.y;
                break;
            case PanAxis.XZ:
                right.y = 0f;
                forward.y = 0f;
                if (right.sqrMagnitude > 0) right.Normalize();
                if (forward.sqrMagnitude > 0) forward.Normalize();
                result = right * input.x + forward * input.y;
                break;
            case PanAxis.YZ:
                forward.x = 0f;
                up.x = 0f;
                if (forward.sqrMagnitude > 0) forward.Normalize();
                if (up.sqrMagnitude > 0) up.Normalize();
                result = forward * input.x + up * input.y;
                break;
        }
        return result;
    }

    private void HandleZoom()
    {
        if (!IsZoom || !isZoomable || ControlManager.Instance.IsHolding) return;
        if (Input.touchCount == 2)
        {
            isZooming = true;
            if (panTween != null && panTween.IsActive()) panTween.Kill();
            Touch touchZero = Input.GetTouch(0);
            Touch touchOne = Input.GetTouch(1);
            Vector2 touchZeroPrevPos = touchZero.position - touchZero.deltaPosition;
            Vector2 touchOnePrevPos = touchOne.position - touchOne.deltaPosition;
            float prevTouchDeltaMag = (touchZeroPrevPos - touchOnePrevPos).magnitude;
            float touchDeltaMag = (touchZero.position - touchOne.position).magnitude;
            float deltaMagnitudeDiff = prevTouchDeltaMag - touchDeltaMag;
            if (cam.orthographic)
            {
                cam.orthographicSize += deltaMagnitudeDiff * zoomSensitivity;
                cam.orthographicSize = Mathf.Clamp(cam.orthographicSize, zoomIn, zoomOut);
            }
            else
            {
                cam.fieldOfView += deltaMagnitudeDiff * zoomSensitivity;
                cam.fieldOfView = Mathf.Clamp(cam.fieldOfView, zoomIn, zoomOut);
            }
        }
        else
        {
            if (isZooming && Input.touchCount == 0)
            {
                isZooming = false;
            }
        }
    }

    private Tween DOZoom(float target, float duration, Ease ease)
    {
        if (cam.orthographic)
        {
            return DOTween.To(
                () => cam.orthographicSize,
                x => cam.orthographicSize = x,
                target,
                duration
            ).SetEase(ease);
        }
        else
        {
            return DOTween.To(
                () => cam.fieldOfView,
                x => cam.fieldOfView = x,
                target,
                duration
            ).SetEase(ease);
        }
    }

    private void KillTweens()
    {
        isPannable = false;
        isPanning = false;
        isZoomable = false;
        isZooming = false;
        if (panTween != null && panTween.IsActive()) panTween.Kill();
        if (zoomTween != null && zoomTween.IsActive()) zoomTween.Kill();
        if (shakeTween != null && shakeTween.IsActive()) shakeTween.Kill();
        if (animationTween != null && animationTween.IsActive()) animationTween.Kill();
        if (animationSeqTween != null && animationSeqTween.IsActive()) animationSeqTween.Kill();
    }
    #endregion

    #region Public API
    public void Shake()
    {
        Shake(shakeTime, shakeIntensity);
    }

    public void Shake(float duration, float strength)
    {
        if (!IsShake) return;
        if (shakeTween != null && shakeTween.IsActive())
            shakeTween.Kill();
        shakeTween = transform.DOShakePosition(
            duration,
            strength,
            shakeVibrato,
            shakeRandomness,
            fadeOut: true
        )
        .SetUpdate(true)
        .OnUpdate(() =>
        {
            transform.position = panTarget + (transform.position - panTarget);
        })
        .OnComplete(() =>
        {
            transform.position = panTarget;
        });
    }

    public void AnimateReturn()
    {
        ControlManager.Instance.IsGameLocked = true;
        KillTweens();
        animationTween = DOTween.Sequence().SetUpdate(true)
            .Join(transform.DOMove(originVector, animationDuration).SetEase(animationEase))
            .Join(DOZoom(animationZoom, animationDuration, animationEase))
            .OnUpdate(() =>
            {
                panTarget = transform.position;
            })
            .OnComplete(() =>
            {
                panTarget = originVector;
                isPannable = true;
                isZoomable = true;
                ControlManager.Instance.IsGameLocked = false;
            });
    }

    public void Animate()
    {
        if (!IsAnimation || animationSteps == null || animationSteps.Length == 0) return;
        ControlManager.Instance.IsGameLocked = true;
        KillTweens();
        AnimationStep step = animationSteps[currentAnimationIndex];
        float duration = step.duration > 0 ? step.duration : animationDuration;
        float zoom = step.zoom > 0 ? step.zoom : animationZoom;
        Vector3 targetPos = step.target;
        animationTween = DOTween.Sequence().SetUpdate(true)
            .Join(transform.DOMove(targetPos, duration).SetEase(animationEase))
            .Join(DOZoom(zoom, duration, animationEase))
            .OnComplete(() =>
            {
                panTarget = targetPos;
                isPannable = true;
                isZoomable = true;
                ControlManager.Instance.IsGameLocked = false;
            });
        currentAnimationIndex++;
        if (currentAnimationIndex >= animationSteps.Length)
            currentAnimationIndex = 0;
    }

    public void AnimateSeq()
    {
        if (!IsAnimationSeq || animationSeqSteps == null || animationSeqSteps.Length == 0) return;
        ControlManager.Instance.IsGameLocked = true;
        KillTweens();
        Sequence seq = DOTween.Sequence().SetUpdate(true);
        for (int i = 0; i < animationSeqSteps.Length; i++)
        {
            AnimationSeqStep step = animationSeqSteps[i];
            float duration = step.duration > 0 ? step.duration : animationDuration;
            float pause = step.pause;
            Ease ease = step.ease == Ease.Unset ? animationSeqEase : step.ease;
            float zoom = step.zoom > 0 ? step.zoom : animationZoom;
            Vector3 target = step.target;
            seq.Append(
                DOTween.Sequence()
                    .Join(transform.DOMove(target, duration).SetEase(ease))
                    .Join(DOZoom(zoom, duration, ease))
            );
            seq.AppendCallback(() =>
            {
                panTarget = target;
            });
            if (pause > 0)
                seq.AppendInterval(pause);
        }
        seq.OnComplete(() =>
        {
            isPannable = true;
            isZoomable = true;
            ControlManager.Instance.IsGameLocked = false;
        });
        animationSeqTween = seq;
    }
    #endregion
}