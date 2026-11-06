using System;
using System.Collections.Generic;
using DG.Tweening;
using UnityEngine;

/// <summary>
/// Handles the dump animation for a tray:
/// tip the tray, unparent marbles and animate them falling, return the tray,
/// then hand each marble off to MarbleAnimation.PlayRollDownRamp so it rolls
/// down the curved ramp rather than being destroyed immediately.
///
/// Slot-to-rail assignment (matches Tray.slotPoints order):
///   slot 0 (left)   → left rail
///   slot 1 (middle) → randomly left or right (50 / 50)
///   slot 2 (right)  → right rail
/// </summary>
public class TrayAnimation : MonoBehaviour
{
    #region Variables
    [Header("References")]
    [Tooltip("The tray mesh child to rotate during the dump animation.")]
    [SerializeField] private Transform trayMesh;

    [Tooltip("Holds the left and right rail waypoints for the ramp. " +
             "Assign the RampWaypoints component from the scene.")]
    [SerializeField] private RampWaypoints rampWaypoints;

    [Header("Tip Animation")]
    [Tooltip("Duration of the tray tipping rotation.")]
    [SerializeField] private float tipDuration = 0.2f;

    [Tooltip("Duration of the tray returning to its original rotation.")]
    [SerializeField] private float returnDuration = 0.15f;

    [Tooltip("Time to wait after the tray returns before handing marbles off to the ramp. " +
             "Should be >= MarbleAnimation.fallDuration so the fall completes first.")]
    [SerializeField] private float destroyDelay = 0.3f;

    private Quaternion originalRotation;
    #endregion

    #region Unity Methods
    private void Start()
    {
        originalRotation = trayMesh.localRotation;
    }
    #endregion

    #region Public Methods
    /// <summary>
    /// Plays the full dump sequence: tip tray → marbles fall → return tray → destroy marbles → callback.
    /// </summary>
    public void PlayDump(List<Marble> marbles, Action onComplete)
    {
        Sequence sequence = DOTween.Sequence();

        // Step 1: Parent marbles to the tray mesh so they rotate with it during the tip
        sequence.AppendCallback(() =>
        {
            foreach (var marble in marbles)
            {
                if (marble == null) continue;
                marble.transform.SetParent(trayMesh, true);
            }
        });

        // Step 2: Tip the tray mesh to -180 on X
        Vector3 tipRotation = originalRotation.eulerAngles;
        tipRotation.x = -180f;
        sequence.Append(
            trayMesh.DOLocalRotate(tipRotation, tipDuration)
                .SetEase(Ease.InQuad)
        );

        // Step 3: At the peak of the tip, unparent marbles and delegate their fall animation
        //         to MarbleAnimation.PlayFallFromTray (Y drop, Z sweep, -Z spin).
        sequence.AppendCallback(() =>
        {
            foreach (var marble in marbles)
            {
                if (marble == null) continue;

                marble.transform.SetParent(null);

                MarbleAnimationManager.Instance?.PlayFallFromTray(marble.transform);
            }
        });

        // Step 4: Return the tray mesh to its original rotation (plays alongside marble fall)
        sequence.Append(
            trayMesh.DOLocalRotateQuaternion(originalRotation, returnDuration)
                .SetEase(Ease.OutQuad)
        );

        // Step 5: Wait for the fall animation to finish, then hand each marble off
        //         to the ramp roll. onComplete fires as soon as all ramp rolls are
        //         started — the next tray advances immediately without waiting for
        //         marbles to finish rolling and be destroyed.
        sequence.AppendInterval(destroyDelay);
        sequence.AppendCallback(() =>
        {
            for (int i = 0; i < marbles.Count; i++)
            {
                Marble marble = marbles[i];
                if (marble == null) continue;

                if (MarbleAnimationManager.Instance == null)
                {
                    // No manager in scene — fall back to immediate destroy.
                    Destroy(marble.gameObject);
                    continue;
                }

                MarbleAnimationManager.Instance.PlayRollDownRamp(marble.transform, GetRampPathForSlot(i), null);
            }

            // Advance to the next tray now that marbles are on the ramp,
            // rather than waiting for them to finish rolling off.
            onComplete?.Invoke();
        });
    }
    #endregion

    #region Private Methods
    /// <summary>
    /// Returns the ramp waypoint path for the marble that occupied the given tray slot index.
    ///   slot 0 → left rail
    ///   slot 1 → random (50 / 50 left or right)
    ///   slot 2 → right rail
    /// Falls back to an empty array if rampWaypoints is not assigned.
    /// </summary>
    private Vector3[] GetRampPathForSlot(int slotIndex)
    {
        if (rampWaypoints == null)
        {
            Debug.LogWarning("[TrayAnimation] rampWaypoints is not assigned — marble will be destroyed without rolling.");
            return new Vector3[0];
        }

        switch (slotIndex)
        {
            case 0:
                return rampWaypoints.GetLeftRailPositions();
            case 2:
                return rampWaypoints.GetRightRailPositions();
            default:
                return UnityEngine.Random.value < 0.5f          // middle marble: coin flip
                    ? rampWaypoints.GetLeftRailPositions()
                    : rampWaypoints.GetRightRailPositions();
        }
    }
    #endregion
}
