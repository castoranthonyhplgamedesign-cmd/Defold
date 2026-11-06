using System;
using DG.Tweening;
using UnityEngine;

/// <summary>
/// Drives the post-intro camera pan. Call OnAllMarblesComplete() from MarbleIntroSpawner
/// once every spawned marble has finished its DOTween sequence.
/// </summary>
public class MarbleIntroAnimation : MonoBehaviour
{
    /// <summary> Fired once the camera pan has fully completed. </summary>
    public static event Action OnIntroPanComplete;

    #region Serialized Fields

    [Header("Camera Pan After Intro")]
    [Tooltip("Camera to animate after intro completes. Falls back to Camera.main if null.")]
    [SerializeField] private Camera introCamera;

    [Tooltip("World-space position the camera moves to.")]
    [SerializeField] private Vector3 cameraPanTargetPosition;

    [Tooltip("Euler angles the camera rotates to.")]
    [SerializeField] private Vector3 cameraPanTargetRotation;

    [Tooltip("Duration of the camera pan in seconds.")]
    [SerializeField] private float cameraPanDuration = 1.5f;

    [Tooltip("Delay after the last marble finishes before the camera starts panning.")]
    [SerializeField] private float cameraPanDelay = 0f;

    [Tooltip("Easing for the camera pan movement and rotation.")]
    [SerializeField] private Ease cameraPanEase = Ease.InOutQuad;

    [Tooltip("Target FOV during the pan. Set to 0 to skip FOV animation.")]
    [SerializeField] private float cameraPanTargetFOV = 45f;

    #endregion

    #region Public API

    /// <summary> Called by MarbleIntroSpawner when every marble sequence has completed. </summary>
    public void OnAllMarblesComplete()
    {
        StartCameraPan();
    }

    #endregion

    #region Private Methods

    /// <summary> Animates the camera to its post-intro position and starts the BGM. </summary>
    private void StartCameraPan()
    {
        DOVirtual.DelayedCall(0.5f, () => AudioManager.Instance.StopSFX("MarbleIntroRolling"));

        Camera cam = introCamera != null ? introCamera : Camera.main;
        if (cam == null) return;

        Sequence camSeq = DOTween.Sequence();
        if (cameraPanDelay > 0f) camSeq.AppendInterval(cameraPanDelay);
        camSeq.Append(cam.transform.DOMove(cameraPanTargetPosition, cameraPanDuration).SetEase(cameraPanEase));
        camSeq.Join(cam.transform.DORotate(cameraPanTargetRotation, cameraPanDuration).SetEase(cameraPanEase));
        if (cameraPanTargetFOV > 0f)
            camSeq.Join(cam.DOFieldOfView(cameraPanTargetFOV, cameraPanDuration).SetEase(cameraPanEase));
        camSeq.OnComplete(() =>
        {
            AudioManager.Instance.PlayMusic("BGM");
            OnIntroPanComplete?.Invoke();
        });
    }

    #endregion
}
