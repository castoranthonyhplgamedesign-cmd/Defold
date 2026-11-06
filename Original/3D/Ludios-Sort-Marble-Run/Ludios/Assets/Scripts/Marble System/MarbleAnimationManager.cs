using System;
using System.Collections.Generic;
using DG.Tweening;
using UnityEngine;

/// <summary>
/// Scene-level singleton that drives all marble animations.
/// Attach this to a single empty GameObject in the scene — no script needs
/// to be placed on individual marble prefabs.
///
/// All three animation phases share a single moveSpeed so marbles maintain
/// constant linear momentum throughout. Durations are computed from
/// path-length / speed rather than from a fixed time, and Ease.Linear is
/// used everywhere to eliminate acceleration discontinuities at boundaries.
///
/// Per-marble previousPosition tracking is handled via closures, so any
/// number of marbles can animate simultaneously without conflict.
/// </summary>
public class MarbleAnimationManager : MonoBehaviour
{
    #region Singleton
    public static MarbleAnimationManager Instance { get; private set; }

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }
    #endregion

    #region Variables
    [Header("Rolling")]
    [Tooltip("Radius of the marble sphere. Used to calculate rolling rotation from distance traveled.")]
    [SerializeField] private float marbleRadius = 0.5f;

    [Header("Movement Speed")]
    [Tooltip("Constant speed (units per second) applied to every animation phase. " +
             "All durations are derived from path-length / speed, so every marble " +
             "moves at the same pace regardless of distance.")]
    [SerializeField] private float moveSpeed = 8f;

    [Header("Phase 2 — Swerve Curve")]
    [Tooltip("Small Z nudge forward before the curve begins.")]
    [SerializeField] private float nudgeForward = 1.5f;

    [Tooltip("Maximum bend when the marble is far from the slot. Scales down for closer columns.")]
    [SerializeField] private float maxSwerveBend = 3f;

    [Tooltip("X distance at which the full bend is applied. Closer columns get proportionally less bend.")]
    [SerializeField] private float fullBendDistance = 6f;

    [Tooltip("Z offset in front of the tray slot where the swerve ends.")]
    [SerializeField] private float swerveEndZOffset = 3f;

    [Tooltip("Multiplier applied to the estimated swerve path length to compensate for the " +
             "extra arc length added by the CatmullRom curve vs straight-line segments. " +
             "Values around 1.1–1.2 keep the swerve speed matching the other phases.")]
    [SerializeField] private float swerveArcCorrection = 1.15f;

    [Header("Phase 3 — Bounce on Impact")]
    [Tooltip("How high the marble pops upward when it hits the ramp surface (world units). " +
             "Keep small — 0.1–0.3 works well.")]
    [SerializeField] private float impactBounceHeight = 0.18f;

    [Tooltip("Total duration of the bounce (rise + fall) expressed as a fraction of the drop duration. " +
             "0.25–0.4 gives a snappy feel without dragging.")]
    [SerializeField] private float bounceDurationFactor = 0.35f;

    [Header("Ramp Roll")]
    [Tooltip("Same arc-length correction factor applied to the ramp path. " +
             "Increase slightly (1.1–1.2) if the marble feels too fast on the ramp.")]
    [SerializeField] private float rampArcCorrection = 1.15f;

    [Header("Fall From Tray")]
    [Tooltip("How far the marble falls on the Y axis (downward) when ejected from the tray.")]
    [SerializeField] private float fallDistance = 5f;

    [Tooltip("How far the marble sweeps on the Z axis (tipping direction) during the arc.")]
    [SerializeField] private float arcZDistance = -3.25f;

    [Tooltip("Duration of the marble fall animation.")]
    [SerializeField] private float fallDuration = 0.25f;

    [Tooltip("Easing for the Z sweep (tipping momentum — decelerates outward).")]
    [SerializeField] private Ease arcZEase = Ease.OutQuad;

    [Tooltip("Easing for the Y fall (gravity — accelerates downward).")]
    [SerializeField] private Ease arcYEase = Ease.InQuad;

    [Tooltip("How high the marble pops upward when it lands after falling from the tray (world units).")]
    [SerializeField] private float fallBounceHeight = 0.18f;

    [Tooltip("Total duration of the fall landing bounce (rise + fall) expressed as a fraction of fallDuration. " +
             "0.25–0.4 gives a snappy feel without dragging.")]
    [SerializeField] private float fallBounceDurationFactor = 0.35f;
    #endregion

    #region Public Methods
    /// <summary>
    /// Animates the marble falling from the tray after it has been unparented:
    /// Y drop (gravity) and Z sweep (tipping momentum) run in parallel, followed
    /// by a small bounce on landing.
    /// </summary>
    public void PlayFallFromTray(Transform marbleTransform)
    {
        Vector3 prevPos = marbleTransform.position;
        float landedY = marbleTransform.position.y - fallDistance;

        Sequence fallSequence = DOTween.Sequence();

        fallSequence.Append(
            marbleTransform.DOMoveY(landedY, fallDuration).SetEase(arcYEase)
        );
        fallSequence.Join(
            marbleTransform.DOMoveZ(marbleTransform.position.z + arcZDistance, fallDuration).SetEase(arcZEase)
        );

        // --- Play Audio ---
        fallSequence.AppendCallback(() => AudioManager.Instance.PlaySFX("MarbleRampDrop"));

        float halfBounce = fallDuration * fallBounceDurationFactor * 0.5f;
        fallSequence.Append(
            marbleTransform.DOMoveY(landedY + fallBounceHeight, halfBounce).SetEase(Ease.OutQuad)
        );
        fallSequence.Append(
            marbleTransform.DOMoveY(landedY, halfBounce).SetEase(Ease.InQuad)
        );

        fallSequence.OnUpdate(() =>
        {
            Vector3 curr = marbleTransform.position;
            ApplyRollingRotation(marbleTransform, curr - prevPos);
            prevPos = curr;
        });
    }

    /// <summary>
    /// Plays the full click-to-tray animation sequence at constant speed.
    /// </summary>
    /// <param name="marbleTransform">The marble's Transform to animate.</param>
    /// <param name="spawnPointPosition">World position of the column's spawn point (front of column).</param>
    /// <param name="targetSlot">The tray slot Transform the marble should land on.</param>
    /// <param name="isAtSpawnPoint">If true, skip the roll phase (already at the spawn point).</param>
    /// <param name="onComplete">Callback fired when the full animation finishes.</param>
    public void PlayMoveToTray(Transform marbleTransform, Vector3 spawnPointPosition, Transform targetSlot, bool isAtSpawnPoint, Action onComplete)
    {
        Sequence sequence = DOTween.Sequence();
        Vector3 slotPos = targetSlot.position;
        Vector3 prevPos = marbleTransform.position;

        // --- Phase 1: Roll ---
        if (!isAtSpawnPoint)
        {
            float rollDistance = Vector3.Distance(marbleTransform.position, spawnPointPosition);
            float rollDuration = rollDistance / moveSpeed;

            sequence.Append(
                marbleTransform.DOMove(spawnPointPosition, rollDuration).SetEase(Ease.Linear)
            );
        }

        // --- Phase 2: Swerve Curve ---
        Vector3 swerveStart = spawnPointPosition;
        Vector3 swerveEnd   = new Vector3(slotPos.x, spawnPointPosition.y, slotPos.z - swerveEndZOffset);

        Vector3 nudgePoint = new Vector3(
            swerveStart.x,
            swerveStart.y,
            swerveStart.z - nudgeForward
        );

        Vector3 mid       = Vector3.Lerp(nudgePoint, swerveEnd, 0.5f);
        float   xDistance = Mathf.Abs(swerveStart.x - slotPos.x);
        float   bendFactor    = Mathf.Clamp01(xDistance / fullBendDistance);
        float   scaledBend    = maxSwerveBend * bendFactor;

        float bendDirection = Mathf.Sign(swerveStart.x - slotPos.x);
        if (xDistance < 0.1f)
            bendDirection = 1f;
        mid.x += scaledBend * bendDirection;

        Vector3[] swervePath = { nudgePoint, mid, swerveEnd };

        float swerveChordLength = Vector3.Distance(swerveStart, nudgePoint)
                                + Vector3.Distance(nudgePoint, mid)
                                + Vector3.Distance(mid, swerveEnd);
        float swerveDuration = swerveChordLength * swerveArcCorrection / moveSpeed;

        sequence.Append(
            marbleTransform.DOPath(swervePath, swerveDuration, PathType.CatmullRom)
                .SetEase(Ease.Linear)
        );

        // --- Phase 3: Drop ---
        float dropDistance = Vector3.Distance(swerveEnd, slotPos);
        float dropDuration = dropDistance / moveSpeed;

        sequence.Append(
            marbleTransform.DOMove(slotPos, dropDuration).SetEase(Ease.Linear)
        );

        // --- Play Audio ---
        sequence.AppendCallback(() => AudioManager.Instance.PlaySFX("MarbleTrayDrop"));

        // --- Bounce on Impact ---
        float halfBounce = dropDuration * bounceDurationFactor * 0.5f;
        sequence.Append(
            marbleTransform.DOMoveY(slotPos.y + impactBounceHeight, halfBounce).SetEase(Ease.OutQuad)
        );
        sequence.Append(
            marbleTransform.DOMoveY(slotPos.y, halfBounce).SetEase(Ease.InQuad)
        );

        sequence.OnUpdate(() =>
        {
            Vector3 curr = marbleTransform.position;
            ApplyRollingRotation(marbleTransform, curr - prevPos);
            prevPos = curr;
        });
        sequence.OnComplete(() => onComplete?.Invoke());
    }

    /// <summary>
    /// Plays the click-to-tray animation for a marble that must advance through its own
    /// column and/or route laterally through one or more adjacent columns before swerving
    /// to the tray.
    ///
    /// Pre-swerve phases — the marble visits each world position in <paramref name="preSwerveWaypoints"/>
    /// in order at constant speed. These positions encode any combination of:
    ///   • Forward rolls within the marble's own column (through departed slots)
    ///   • Lateral rolls at a common depth through intermediate columns
    ///   • A forward roll to the target column's spawn point
    ///
    /// After all waypoints are reached the marble is at <paramref name="spawnPoint"/> and the
    /// standard swerve → drop → bounce phases run identically to PlayMoveToTray.
    /// </summary>
    /// <param name="marbleTransform">The marble's Transform to animate.</param>
    /// <param name="preSwerveWaypoints">Ordered world positions to visit before the swerve.</param>
    /// <param name="spawnPoint">Target column's spawn — the swerve curve starts here.</param>
    /// <param name="targetSlot">The tray slot the marble should land on.</param>
    /// <param name="onComplete">Callback fired when the full animation finishes.</param>
    public void PlayMoveToTrayViaPath(Transform marbleTransform, List<Vector3> preSwerveWaypoints,
                                      Vector3 spawnPoint, Transform targetSlot, Action onComplete)
    {
        Sequence sequence = DOTween.Sequence();
        Vector3 slotPos   = targetSlot.position;
        Vector3 prevPos   = marbleTransform.position;

        // --- Pre-swerve waypoints: roll through each position at constant speed ---
        Vector3 from = marbleTransform.position;
        foreach (Vector3 wp in preSwerveWaypoints)
        {
            float dist = Vector3.Distance(from, wp);
            if (dist > 0.01f)
                sequence.Append(marbleTransform.DOMove(wp, dist / moveSpeed).SetEase(Ease.Linear));
            from = wp;
        }

        // --- Phase 2: Swerve Curve (from spawnPoint) ---
        Vector3 swerveStart = spawnPoint;
        Vector3 swerveEnd   = new Vector3(slotPos.x, spawnPoint.y, slotPos.z - swerveEndZOffset);

        Vector3 nudgePoint = new Vector3(swerveStart.x, swerveStart.y, swerveStart.z - nudgeForward);
        Vector3 mid        = Vector3.Lerp(nudgePoint, swerveEnd, 0.5f);

        float xDistance   = Mathf.Abs(swerveStart.x - slotPos.x);
        float bendFactor  = Mathf.Clamp01(xDistance / fullBendDistance);
        float scaledBend  = maxSwerveBend * bendFactor;

        float bendDirection = Mathf.Sign(swerveStart.x - slotPos.x);
        if (xDistance < 0.1f)
            bendDirection = 1f;
        mid.x += scaledBend * bendDirection;

        Vector3[] swervePath = { nudgePoint, mid, swerveEnd };

        float swerveChordLength = Vector3.Distance(swerveStart, nudgePoint)
                                + Vector3.Distance(nudgePoint, mid)
                                + Vector3.Distance(mid, swerveEnd);
        float swerveDuration = swerveChordLength * swerveArcCorrection / moveSpeed;

        sequence.Append(
            marbleTransform.DOPath(swervePath, swerveDuration, PathType.CatmullRom)
                .SetEase(Ease.Linear)
        );

        // --- Phase 3: Drop ---
        float dropDistance = Vector3.Distance(swerveEnd, slotPos);
        float dropDuration = dropDistance / moveSpeed;

        sequence.Append(
            marbleTransform.DOMove(slotPos, dropDuration).SetEase(Ease.Linear)
        );

        // --- Play Audio ---
        sequence.AppendCallback(() => AudioManager.Instance.PlaySFX("MarbleTrayDrop"));

        // --- Bounce on Impact ---
        float halfBounce = dropDuration * bounceDurationFactor * 0.5f;
        sequence.Append(
            marbleTransform.DOMoveY(slotPos.y + impactBounceHeight, halfBounce).SetEase(Ease.OutQuad)
        );
        sequence.Append(
            marbleTransform.DOMoveY(slotPos.y, halfBounce).SetEase(Ease.InQuad)
        );

        sequence.OnUpdate(() =>
        {
            Vector3 curr = marbleTransform.position;
            ApplyRollingRotation(marbleTransform, curr - prevPos);
            prevPos = curr;
        });
        sequence.OnComplete(() => onComplete?.Invoke());
    }

    /// <summary>
    /// Animates the marble rolling down the ramp along the given world-space waypoints
    /// using a smooth CatmullRom spline. The marble destroys itself once it reaches
    /// the final waypoint.
    /// </summary>
    /// <param name="marbleTransform">The marble's Transform to animate.</param>
    /// <param name="pathPositions">
    ///     Ordered world-space positions from the ramp entry point to the bottom.
    ///     Requires at least 2 points; 4+ recommended for smooth CatmullRom curves.
    /// </param>
    /// <param name="onComplete">Callback fired just before the GameObject is destroyed.</param>
    public void PlayRollDownRamp(Transform marbleTransform, Vector3[] pathPositions, Action onComplete)
    {
        if (pathPositions == null || pathPositions.Length < 2)
        {
            Debug.LogWarning($"[MarbleAnimationManager] PlayRollDownRamp on '{marbleTransform.name}': " +
                             "needs at least 2 waypoints — marble destroyed immediately.");
            onComplete?.Invoke();
            Destroy(marbleTransform.gameObject);
            return;
        }

        Vector3 prevPos = marbleTransform.position;

        float pathLength = Vector3.Distance(marbleTransform.position, pathPositions[0]);
        for (int i = 1; i < pathPositions.Length; i++)
            pathLength += Vector3.Distance(pathPositions[i - 1], pathPositions[i]);

        float duration = pathLength * rampArcCorrection / moveSpeed;

        marbleTransform.DOPath(pathPositions, duration, PathType.CatmullRom)
            .SetEase(Ease.InOutQuad)
            .OnUpdate(() =>
            {
                Vector3 curr = marbleTransform.position;
                ApplyRollingRotation(marbleTransform, curr - prevPos);
                prevPos = curr;
            })
            .OnComplete(() =>
            {
                onComplete?.Invoke();
                Destroy(marbleTransform.gameObject);
            });
    }
    #endregion

    #region Private Methods
    /// <summary>
    /// Applies rolling rotation to a marble based on its frame-to-frame movement delta.
    /// </summary>
    private void ApplyRollingRotation(Transform t, Vector3 delta)
    {
        float distance = delta.magnitude;
        if (distance < 0.0001f)
            return;

        Vector3 movementDirection = delta.normalized;
        Vector3 rotationAxis      = Vector3.Cross(Vector3.up, movementDirection);

        float angleDegrees = (distance / marbleRadius) * Mathf.Rad2Deg;

        t.Rotate(rotationAxis, angleDegrees, Space.World);
    }
    #endregion
}
