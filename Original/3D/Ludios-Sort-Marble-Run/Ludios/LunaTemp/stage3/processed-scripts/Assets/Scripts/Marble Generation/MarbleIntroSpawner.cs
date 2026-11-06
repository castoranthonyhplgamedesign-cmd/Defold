using System.Collections;
using DG.Tweening;
using UnityEngine;

/// <summary>
/// Spawns a stream of intro marbles, animates each one through three phases:
/// fall into the neck, roll along the neck floor, then fan out through the flare.
/// Notifies MarbleIntroAnimation when all sequences have completed.
/// </summary>
public class MarbleIntroSpawner : MonoBehaviour
{
    #region Serialized Fields
    [Header("References")]
    [Tooltip("ScriptableObject that maps MarbleType to prefab.")]
    [SerializeField] private MarbleDatabase marbleDatabase;

    [Tooltip("Notified via OnAllMarblesComplete() once every marble has finished.")]
    [SerializeField] private MarbleIntroAnimation marbleIntroAnimation;

    [Tooltip("Parent Transform under which spawned intro marbles are placed.")]
    [SerializeField] private Transform marbleParent;

    [Header("Batch Spawning")]
    [Tooltip("Number of marbles per batch. All marbles in a batch are launched simultaneously.")]
    [SerializeField] private int batchSize = 3;

    [Tooltip("Delay between spawning each batch. Tweak to control stream cadence.")]
    [SerializeField] private float batchInterval = 0.2f;

    [Tooltip("How many batches to spawn in total. Total marbles = batchSize × batchCount.")]
    [SerializeField] private int batchCount = 15;

    [Header("Spawn — Stream Entry")]
    [Tooltip("World Y at which marbles are instantiated — above the neck face.")]
    [SerializeField] private float streamSpawnY = 16f;

    [Tooltip("World X of the neck centre. The spawn row is centred on this X.")]
    [SerializeField] private float neckCentreX = 0f;

    [Tooltip("World Z at which marbles are instantiated.")]
    [SerializeField] private float streamSpawnZ = 125f;

    [Tooltip("Radius used to space marbles apart in the spawn row. Spawn diameter = spawnRadius × 2.")]
    [SerializeField] private float spawnRadius = 1f;

    [Header("Neck — Fall Phase")]
    [Tooltip("World Y of the neck face (platform surface). Marbles fall straight down to here.")]
    [SerializeField] private float neckFaceY = 1f;

    [Tooltip("Speed (units/sec) during the vertical fall. Ease.Linear keeps the drop uniform.")]
    [SerializeField] private float neckFallSpeed = 25f;

    [Header("Neck — Roll Phase")]
    [Tooltip("World Z at the bottom of the neck — used as the spread point when no peak slot exists yet (fallback).")]
    [SerializeField] private float neckBottomZ = 115f;

    [Tooltip("How far behind the peak Z overflow marbles begin to diverge. Increase to push the diverge point further back so overflow marbles clear the filled triangle.")]
    [SerializeField] private float spreadBeforePeakZ = -3.25f;

    [Header("Flare Spread")]
    [Tooltip("Half-width of the flare fan at the base row. Triangle narrows to a point at flarePeakDepth.")]
    [SerializeField] private float flareWidth = 10f;

    [Tooltip("World Y of the final resting position at the bottom of the flare.")]
    [SerializeField] private float flareTargetY = 1f;

    [Tooltip("World Z of the base line where marbles settle after spreading.")]
    [SerializeField] private float flareTargetZ = 99.5f;

    [Tooltip("How far forward (Z) the tip of the inverted-V extends beyond flareTargetZ. Marbles at X=0 can reach up to this extra depth; marbles fill the triangle interior.")]
    [SerializeField] private float flarePeakDepth = 15f;

    [Header("Rolling")]
    [Tooltip("Speed (units/sec) used for all rolling phases: neck floor and flare spread.")]
    [SerializeField] private float rollingSpeed = 15f;

    [Tooltip("Radius used to calculate rolling rotation from distance travelled.")]
    [SerializeField] private float rollingRadius = 0.5f;

    [Tooltip("Radius used to pack marbles in the flare triangle. Slot diameter = slotRadius × 2.")]
    [SerializeField] private float slotRadius = 1f;

    [Header("Triangle Shape")]
    [Tooltip("Number of marbles in the bottom row of the triangle.")]
    [SerializeField] private int triangleBottomCount = 7;

    [Tooltip("How many marbles to remove from each successive row going toward the tip.")]
    [SerializeField] private int triangleRowStep = 1;

    [Header("Overflow Slide")]
    [Tooltip("Extra X distance added beyond the triangle's outermost slot before the marble falls. Increase to push overflow marbles further out so they clear the triangle edge.")]
    [SerializeField] private float overflowSideExtraX = 3f;

    [Tooltip("Additional X offset added to the left or right marble when the middle marble is heading to the same side, preventing collision during the diagonal slide.")]
    [SerializeField] private float overflowMiddleCollisionExtraX = 2f;

    [Tooltip("Extra Z distance rolled diagonally past the base corner before the marble drops. Increase to push the fall point further forward so it clears the platform edge.")]
    [SerializeField] private float overflowFallOvershootZ = 5f;

    [Header("New Intro")]
    [Tooltip("When enabled, skips the stream animation. Spawns all marbles at once with randomised X and Y positions, drops each to a landing Y, then rolls it out along the X axis.")]
    [SerializeField] private bool newIntro = false;

    [Tooltip("Minimum world Z for new-intro marble spawn positions.")]
    [SerializeField] private float newIntroSpawnMinZ = 113f;

    [Tooltip("Maximum world Z for new-intro marble spawn positions.")]
    [SerializeField] private float newIntroSpawnMaxZ = 117f;

    [Tooltip("Minimum world X for new-intro marble spawn positions.")]
    [SerializeField] private float newIntroSpawnMinX = -5f;

    [Tooltip("Maximum world X for new-intro marble spawn positions.")]
    [SerializeField] private float newIntroSpawnMaxX = 5f;

    [Tooltip("Minimum world Y at which new-intro marbles are spawned — they fall down from here.")]
    [SerializeField] private float newIntroSpawnMinY = 10f;

    [Tooltip("Maximum world Y at which new-intro marbles are spawned — they fall down from here.")]
    [SerializeField] private float newIntroSpawnMaxY = 16f;

    [Tooltip("World Y at which new-intro marbles land before rolling out.")]
    [SerializeField] private float newIntroLandY = 1f;

    [Tooltip("Total number of marbles to spawn in the new intro.")]
    [SerializeField] private int newIntroMarbleCount = 20;

    [Tooltip("Speed (units/sec) of the fall phase. Lower marbles land sooner, higher marbles later.")]
    [SerializeField] private float newIntroFallSpeed = 20f;

    [Tooltip("Distance each marble rolls outward along X after landing.")]
    [SerializeField] private float newIntroRollDistance = 8f;

    [Tooltip("Duration of the outward roll phase (seconds).")]
    [SerializeField] private float newIntroRollDuration = 0.5f;

    [Header("New Intro — Smart Spawn")]
    [Tooltip("Seed for the deterministic marble layout. Same seed = same positions and types every play. Change until you find a no-clip arrangement.")]
    [SerializeField] private int newIntroSeed = 42;

    [Tooltip("Fallback radius used for overlap checks when no SphereCollider is found on the prefab.")]
    [SerializeField] private float newIntroFallbackRadius = 0.5f;

    [Tooltip("How many random positions to try per marble before giving up and placing it anyway.")]
    [SerializeField] private int newIntroMaxPlacementAttempts = 30;

    [Tooltip("Number of marbles to spawn per batch in the new intro. Smaller batches reduce the chance of spawn-frame clipping.")]
    [SerializeField] private int newIntroBatchSize = 3;

    [Tooltip("Delay in seconds between each new-intro batch.")]
    [SerializeField] private float newIntroBatchInterval = 0.1f;

    [Tooltip("Delay in seconds after all new-intro marbles finish before OnAllMarblesComplete is called.")]
    [SerializeField] private float newIntroCompletionDelay = 1f;

    private int _pending = 0;
    private int _overflowPending = 0;
    private bool _rollingPlayed = false;
    private Vector3[] _flareSlots;
    private int _slotIndex = 0;
    private float _spreadZ; //Z at which marbles begin to spread. Derived from the peak slot once slots are built; falls back to neckBottomZ.
    private System.Collections.Generic.List<(Vector3 center, float radius)> _placedSpheres;
    private System.Random _seededRandom;
    #endregion

    #region Unity Lifecycle
    /// <summary> Begins the spawn loop. </summary>
    private void Start()
    {
        if (marbleDatabase == null)
        {
            Debug.LogError("[MarbleIntroSpawner] No MarbleDatabase assigned.");
            return;
        }

        if (marbleIntroAnimation == null)
        {
            Debug.LogError("[MarbleIntroSpawner] No MarbleIntroAnimation assigned.");
            return;
        }

        int totalMarbles = 0;
        for (int n = triangleBottomCount; n > 0; n -= triangleRowStep)
            totalMarbles += n;
        _flareSlots = BuildFlareSlots(totalMarbles);

        // Dynamic spread point: pull back from the peak by the configured offset.
        // Falls back to neckBottomZ if the slot array is somehow empty.
        if (_flareSlots.Length > 0)
        {
            float peakZ = _flareSlots[_flareSlots.Length - 1].z;
            _spreadZ = peakZ - spreadBeforePeakZ;
        }
        else
        {
            _spreadZ = neckBottomZ;
        }

        if (newIntro)
        {
            _seededRandom = new System.Random(newIntroSeed);
            StartCoroutine(NewIntroSpawnLoop());
            StartCoroutine(DelayedCompletion());
        }
        else
        {
            StartCoroutine(SpawnLoop());
        }
    }
    #endregion

    #region Spawn Loop
    /// <summary> Spawns marbles in batches separated by a fixed batchInterval delay. </summary>
    private IEnumerator SpawnLoop()
    {
        MarbleType[] allTypes = (MarbleType[])System.Enum.GetValues(typeof(MarbleType));

        // Pre-compute base corners once the slots are built.
        float leftmostX  = _flareSlots[0].x;
        float rightmostX = _flareSlots[0].x;
        for (int k = 1; k < _flareSlots.Length; k++)
        {
            if (_flareSlots[k].x < leftmostX)  leftmostX  = _flareSlots[k].x;
            if (_flareSlots[k].x > rightmostX) rightmostX = _flareSlots[k].x;
        }
        Vector3 baseLeft  = new Vector3(leftmostX  - overflowSideExtraX, flareTargetY, flareTargetZ);
        Vector3 baseRight = new Vector3(rightmostX + overflowSideExtraX, flareTargetY, flareTargetZ);

        // The peak slot is the tip of the triangle — last in the array.
        Vector3 peakSlot = _flareSlots[_flareSlots.Length - 1];

        for (int b = 0; b < batchCount; b++)
        {
            bool isOverflow = _slotIndex >= _flareSlots.Length;

            if (isOverflow)
            {
                // Overflow batch: marbles fall + roll forward exactly as normal until they
                // reach the peak Z, then diverge diagonally across the triangle surface.

                // Pre-determine slide directions so we can detect same-side conflicts
                // before building per-marble base corners.
                // Left marble (i=0) always goes left, right marble (i=last) always goes right,
                // middle marble(s) are random.
                bool[] perMarbleSlidesLeft = new bool[batchSize];
                for (int i = 0; i < batchSize; i++)
                {
                    if (i == 0)
                        perMarbleSlidesLeft[i] = true;
                    else if (i == batchSize - 1)
                        perMarbleSlidesLeft[i] = false;
                    else
                        perMarbleSlidesLeft[i] = Random.value < 0.5f;
                }

                // Build per-marble extra X offsets.
                // If the middle marble goes to the same side as the outer marble on that side,
                // push the outer marble further out by overflowMiddleCollisionExtraX.
                float[] perMarbleExtraX = new float[batchSize];
                for (int i = 0; i < batchSize; i++)
                {
                    perMarbleExtraX[i] = 0f;

                    // Only outer marbles (left=0, right=last) need the extra push.
                    if (i == 0)
                    {
                        // Check if any middle marble also goes left.
                        for (int m = 1; m < batchSize - 1; m++)
                        {
                            if (perMarbleSlidesLeft[m])
                            {
                                perMarbleExtraX[i] = overflowMiddleCollisionExtraX;
                                break;
                            }
                        }
                    }
                    else if (i == batchSize - 1)
                    {
                        // Check if any middle marble also goes right.
                        for (int m = 1; m < batchSize - 1; m++)
                        {
                            if (!perMarbleSlidesLeft[m])
                            {
                                perMarbleExtraX[i] = overflowMiddleCollisionExtraX;
                                break;
                            }
                        }
                    }
                }

                for (int i = 0; i < batchSize; i++)
                {
                    MarbleType type   = allTypes[Random.Range(0, allTypes.Length)];
                    GameObject prefab = marbleDatabase.GetPrefab(type);
                    if (prefab == null) continue;

                    float rowStartX  = neckCentreX - (batchSize - 1) * spawnRadius;
                    float spawnX     = rowStartX + i * spawnRadius * 2f;
                    Vector3 spawnPos = new Vector3(spawnX, streamSpawnY, streamSpawnZ);

                    GameObject marble = Instantiate(prefab, spawnPos, Random.rotation, marbleParent);

                    Marble marbleScript = marble.GetComponent<Marble>();
                    if (marbleScript != null)
                        Destroy(marbleScript);

                    _pending++;
                    _overflowPending++;
                    AnimateOverflowMarble(marble.transform, spawnX, baseLeft, baseRight, perMarbleSlidesLeft[i], perMarbleExtraX[i]);
                }
            }
            else
            {
                // Normal fill: collect slots for this batch, sort left-to-right.
                int batchSlotCount = 0;
                System.Collections.Generic.List<Vector3> batchSlots = new System.Collections.Generic.List<Vector3>();
                for (int i = 0; i < batchSize; i++)
                {
                    if (_slotIndex + i >= _flareSlots.Length) break;
                    batchSlots.Add(_flareSlots[_slotIndex + i]);
                    batchSlotCount++;
                }
                batchSlots.Sort((a, b2) => a.x.CompareTo(b2.x));
                _slotIndex += batchSlotCount;

                for (int i = 0; i < batchSlotCount; i++)
                {
                    MarbleType type   = allTypes[Random.Range(0, allTypes.Length)];
                    GameObject prefab = marbleDatabase.GetPrefab(type);
                    if (prefab == null) continue;

                    float rowStartX  = neckCentreX - (batchSlotCount - 1) * spawnRadius;
                    float spawnX     = rowStartX + i * spawnRadius * 2f;
                    Vector3 spawnPos = new Vector3(spawnX, streamSpawnY, streamSpawnZ);

                    GameObject marble = Instantiate(prefab, spawnPos, Random.rotation, marbleParent);

                    Marble marbleScript = marble.GetComponent<Marble>();
                    if (marbleScript != null)
                        Destroy(marbleScript);

                    _pending++;
                    AnimateMarble(marble.transform, batchSlots[i], spawnX);
                }
            }

            yield return new WaitForSeconds(batchInterval);
        }

    }
    #endregion

    #region New Intro Spawn Loop
    /// <summary> Spawns new-intro marbles in batches to avoid spawn-frame clipping, then animates each. </summary>
    private IEnumerator NewIntroSpawnLoop()
    {
        MarbleType[] allTypes = (MarbleType[])System.Enum.GetValues(typeof(MarbleType));
        _placedSpheres = new System.Collections.Generic.List<(Vector3 center, float radius)>();

        int spawned = 0;
        while (spawned < newIntroMarbleCount)
        {
            int batchEnd = Mathf.Min(spawned + newIntroBatchSize, newIntroMarbleCount);
            for (int i = spawned; i < batchEnd; i++)
            {
                MarbleType type   = allTypes[_seededRandom.Next(0, allTypes.Length)];
                GameObject prefab = marbleDatabase.GetPrefab(type);
                if (prefab == null) continue;

                float marbleRadius = GetPrefabRadius(prefab);
                Vector3 spawnPos   = FindNonOverlappingPosition(marbleRadius);

                float rx = (float)(_seededRandom.NextDouble() * 360.0);
                float ry = (float)(_seededRandom.NextDouble() * 360.0);
                float rz = (float)(_seededRandom.NextDouble() * 360.0);
                GameObject marble = Instantiate(prefab, spawnPos, Quaternion.Euler(rx, ry, rz), marbleParent);

                Marble marbleScript = marble.GetComponent<Marble>();
                if (marbleScript != null)
                    Destroy(marbleScript);

                _placedSpheres.Add((spawnPos, marbleRadius));
                _pending++;
                AnimateNewIntroMarble(marble.transform);
            }

            spawned = batchEnd;
            if (spawned < newIntroMarbleCount)
                yield return new WaitForSeconds(newIntroBatchInterval);
        }

        yield return null;
    }
    #endregion

    #region Animation
    /// <summary> Runs the three-phase DOTween sequence (fall, roll, flare) for one marble. </summary>
    private void AnimateMarble(Transform marble, [Bridge.Ref] Vector3 slot, float spawnX)
    {
        // Phase 1: fall straight down to the neck face, keeping the marble's spawn X.
        Vector3 neckFacePos = new Vector3(spawnX, neckFaceY, streamSpawnZ);
        float fallDist     = Mathf.Abs(marble.position.y - neckFaceY);
        float fallDuration = Mathf.Max(fallDist / neckFallSpeed, 0.05f);

        // Phase 2: roll forward along the neck floor to the bottom of the neck.
        Vector3 neckBottomPos = new Vector3(spawnX, neckFaceY, neckBottomZ);
        float rollDist     = Mathf.Abs(neckBottomZ - streamSpawnZ);
        float rollDuration = Mathf.Max(rollDist / rollingSpeed, 0.05f);

        // Phase 3: move to the pre-assigned triangle slot.
        Vector3 finalPos = new Vector3(slot.x, flareTargetY, slot.z);
        float flareDist     = Vector3.Distance(neckBottomPos, finalPos);
        float flareDuration = Mathf.Max(flareDist / rollingSpeed, 0.05f);

        Sequence seq = DOTween.Sequence();

        // Phase 1: vertical fall — spin on -X (forward roll) to match the direction of travel.
        seq.Append(marble.DOMove(neckFacePos, fallDuration).SetEase(Ease.Linear));
        seq.Join(SpinTween(marble, -Vector3.right, fallDist, fallDuration));

        // Collision sound at the neck face; start looping roll SFX on first marble to reach here.
        seq.AppendCallback(() =>
        {
            AudioManager.Instance.PlaySFX("MarbleRampDrop");
            AudioManager.Instance.PlaySFX("MarbleIntroRolling");
        });

        // Phase 2: roll along the neck floor toward the flare.
        seq.Append(marble.DOMove(neckBottomPos, rollDuration).SetEase(Ease.Linear));
        seq.Join(SpinTween(marble, RollingAxis(neckBottomPos - neckFacePos), rollDist, rollDuration));

        // Phase 3: fan out through the flare.
        seq.Append(marble.DOMove(finalPos, flareDuration).SetEase(Ease.Linear));
        seq.Join(SpinTween(marble, RollingAxis(finalPos - neckBottomPos), flareDist, flareDuration));

        seq.OnComplete(OnMarbleSequenceComplete);
    }

    /// <summary>
    /// Overflow path: fall + roll to the peak Z, then slide diagonally across the triangle
    /// surface to the assigned base corner, then fall off the ledge.
    /// </summary>
    private void AnimateOverflowMarble(Transform marble, float spawnX, [Bridge.Ref] Vector3 baseLeft, [Bridge.Ref] Vector3 baseRight, bool slidesLeft, float extraX)
    {
        // Phase 1: fall straight down to the neck face.
        Vector3 neckFacePos = new Vector3(spawnX, neckFaceY, streamSpawnZ);
        float fallDist     = Mathf.Abs(marble.position.y - neckFaceY);
        float fallDuration = Mathf.Max(fallDist / neckFallSpeed, 0.05f);

        // Phase 2: roll forward along the neck floor to the dynamic spread point.
        Vector3 neckBottomPos = new Vector3(spawnX, neckFaceY, _spreadZ);
        float rollDist     = Mathf.Abs(_spreadZ - streamSpawnZ);
        float rollDuration = Mathf.Max(rollDist / rollingSpeed, 0.05f);

        // Phase 3+4: diagonal slide from the diverge point all the way past the base corner.
        // extraX pushes the outer marble further out when the middle marble shares the same side.
        Vector3 baseCorner = slidesLeft
            ? new Vector3(baseLeft.x  - extraX, baseLeft.y,  baseLeft.z)
            : new Vector3(baseRight.x + extraX, baseRight.y, baseRight.z);
        Vector3 slideDir     = (baseCorner - neckBottomPos).normalized;
        Vector3 overshootPos = baseCorner + slideDir * overflowFallOvershootZ;
        float slideDist      = Vector3.Distance(neckBottomPos, overshootPos);
        float slideDuration  = Mathf.Max(slideDist / rollingSpeed, 0.05f);

        // Phase 6: fall off the ledge — drop straight down out of frame.
        Vector3 fallOffPos    = new Vector3(overshootPos.x, overshootPos.y - 25f, overshootPos.z);
        float fallOffDuration = Mathf.Max(20f / neckFallSpeed, 0.05f);

        Sequence seq = DOTween.Sequence();

        // Phase 1: vertical fall into the neck.
        seq.Append(marble.DOMove(neckFacePos, fallDuration).SetEase(Ease.Linear));
        seq.Join(SpinTween(marble, -Vector3.right, fallDist, fallDuration));

        // Collision sound at the neck face; start looping roll SFX on first marble to reach here.
        seq.AppendCallback(() => AudioManager.Instance.PlaySFX("MarbleRampDrop"));

        // Phase 2: roll along the neck floor to the diverge point.
        seq.Append(marble.DOMove(neckBottomPos, rollDuration).SetEase(Ease.Linear));
        seq.Join(SpinTween(marble, RollingAxis(neckBottomPos - neckFacePos), rollDist, rollDuration));

        seq.AppendCallback(() => AudioManager.Instance.PlaySFX("MarbleIntroCollision"));

        // Phase 3+4: continuous diagonal slide from diverge point through base corner to overshoot.
        seq.Append(marble.DOMove(overshootPos, slideDuration).SetEase(Ease.Linear));
        seq.Join(SpinTween(marble, RollingAxis(overshootPos - neckBottomPos), slideDist, slideDuration));

        // Phase 6: fall off the ledge. Stop rolling SFX when the last overflow marble starts falling.
        seq.AppendCallback(() =>
        {
            _overflowPending--;
            //if (_overflowPending <= 0 && AudioManager.Instance != null)
                //AudioManager.Instance.StopSFXLooping("MarbleIntroRolling");
        });
        seq.Append(marble.DOMove(fallOffPos, fallOffDuration).SetEase(Ease.InQuad));
        seq.Join(SpinTween(marble, -Vector3.right, 25f, fallOffDuration));

        seq.AppendCallback(() => AudioManager.Instance.PlaySFX("MarbleWaterDrop"));

        seq.OnComplete(OnMarbleSequenceComplete);
    }

    /// <summary> Drops a marble straight down to the landing Y, then rolls it out along the X axis. </summary>
    private void AnimateNewIntroMarble(Transform marble)
    {
        Vector3 spawnPos = marble.position;
        Vector3 landPos  = new Vector3(spawnPos.x, newIntroLandY, spawnPos.z);

        // Roll direction is based on spawn X relative to the centre of the spawn range.
        float spawnCentreX = (newIntroSpawnMinX + newIntroSpawnMaxX) * 0.5f;
        bool goRight       = spawnPos.x >= spawnCentreX;
        Vector3 rollDir  = goRight ? Vector3.right : -Vector3.right;
        Vector3 rollEnd  = landPos + rollDir * newIntroRollDistance;

        float rollDist   = newIntroRollDistance;
        float angleDeg   = (rollDist / rollingRadius) * Mathf.Rad2Deg;
        Vector3 spinAxis = goRight ? -Vector3.forward : Vector3.forward;
        Vector3 eulerSpin = spinAxis * angleDeg;

        Sequence seq = DOTween.Sequence();

        float fallDist     = spawnPos.y - newIntroLandY;
        float fallDuration = Mathf.Max(fallDist / newIntroFallSpeed, 0.05f);

        seq.Append(marble.DOMove(landPos, fallDuration).SetEase(Ease.Linear));
        seq.AppendCallback(() =>
            {
                AudioManager.Instance.PlaySFX("MarbleRampDrop");
                if (!_rollingPlayed)
                {
                    _rollingPlayed = true;
                    AudioManager.Instance.PlaySFX("MarbleIntroRolling");
                }
            });
        seq.Append(marble.DOMove(rollEnd, newIntroRollDuration).SetEase(Ease.Linear));
        seq.Join(marble.DORotate(eulerSpin, newIntroRollDuration, RotateMode.WorldAxisAdd).SetEase(Ease.Linear));

        seq.OnComplete(OnMarbleSequenceComplete);
    }

    /// <summary> Decrements pending counter; stops the rolling SFX and fires the completion callback when all marbles are done. </summary>
    private void OnMarbleSequenceComplete()
    {
        _pending--;
        if (_pending <= 0)
        {
            //if (AudioManager.Instance != null)
                //AudioManager.Instance.StopSFXLooping("MarbleIntroRolling");
            if (!newIntro)
                marbleIntroAnimation.OnAllMarblesComplete();
        }
    }

    /// <summary> Waits for newIntroCompletionDelay seconds then fires OnAllMarblesComplete. </summary>
    private IEnumerator DelayedCompletion()
    {
        yield return new WaitForSeconds(newIntroCompletionDelay);
        marbleIntroAnimation.OnAllMarblesComplete();
    }
    #endregion

    #region Helpers
    /// <summary>
    /// Pre-generates slot positions row by row, starting with triangleBottomCount marbles
    /// at flareTargetZ and reducing by triangleRowStep each row toward the tip.
    /// Rows are emitted base-first so the bottom row fills before the peak.
    /// </summary>
    private Vector3[] BuildFlareSlots(int maxCount)
    {
        float diameter = slotRadius * 2f;
        System.Collections.Generic.List<Vector3> slots = new System.Collections.Generic.List<Vector3>();

        int rowCount   = 0;
        int rowMarbles = triangleBottomCount;

        while (rowMarbles > 0)
        {
            float z       = flareTargetZ + slotRadius + rowCount * diameter;
            float rowHalf = (rowMarbles - 1) * slotRadius; // centres marbles symmetrically on X=0
            int mid2 = rowMarbles / 2;

            // leftNearest[0] = closest left slot to centre, leftNearest[last] = outermost left.
            System.Collections.Generic.List<float> leftNearest  = new System.Collections.Generic.List<float>();
            System.Collections.Generic.List<float> rightNearest = new System.Collections.Generic.List<float>();

            for (int i = mid2 - 1; i >= 0; i--)
                leftNearest.Add(-rowHalf + i * diameter);

            int rStart = (rowMarbles % 2 == 0) ? mid2 : mid2 + 1;
            for (int i = rStart; i < rowMarbles; i++)
                rightNearest.Add(-rowHalf + i * diameter);

            // Pool: centre slot first (if odd row), then pairs (left, right) closest-outward.
            System.Collections.Generic.List<float> pool = new System.Collections.Generic.List<float>();
            if (rowMarbles % 2 != 0)
                pool.Add(-rowHalf + mid2 * diameter);
            int li = 0, ri = 0;
            while (li < leftNearest.Count || ri < rightNearest.Count)
            {
                if (li < leftNearest.Count)  pool.Add(leftNearest[li++]);
                if (ri < rightNearest.Count) pool.Add(rightNearest[ri++]);
            }

            // Slice pool into batchSize chunks, sort each chunk left-to-right, then flatten.
            for (int start = 0; start < pool.Count; start += batchSize)
            {
                int end = Mathf.Min(start + batchSize, pool.Count);
                System.Collections.Generic.List<float> chunk = new System.Collections.Generic.List<float>();
                for (int k = start; k < end; k++)
                    chunk.Add(pool[k]);
                chunk.Sort();
                for (int k = 0; k < chunk.Count; k++)
                {
                    slots.Add(new Vector3(chunk[k], flareTargetY, z));
                    if (slots.Count >= maxCount) break;
                }
                if (slots.Count >= maxCount) break;
            }

            if (slots.Count >= maxCount) break;

            rowCount++;
            rowMarbles -= triangleRowStep;
        }

        return slots.ToArray();
    }

    /// <summary>
    /// Returns the world-space sphere radius for a prefab by reading its SphereCollider radius
    /// scaled by the prefab's uniform scale. Falls back to newIntroFallbackRadius if none is found.
    /// </summary>
    private float GetPrefabRadius(GameObject prefab)
    {
        SphereCollider col = prefab.GetComponent<SphereCollider>();
        if (col != null)
            return col.radius * prefab.transform.localScale.x;
        return newIntroFallbackRadius;
    }

    /// <summary>
    /// Tries up to newIntroMaxPlacementAttempts random positions within the new-intro spawn bounds
    /// and returns the first one that does not overlap any already-placed sphere.
    /// Falls back to the last attempted position if no clear spot is found.
    /// </summary>
    private Vector3 FindNonOverlappingPosition(float radius)
    {
        Vector3 candidate = Vector3.zero;
        for (int attempt = 0; attempt < newIntroMaxPlacementAttempts; attempt++)
        {
            float x = newIntroSpawnMinX + (float)(_seededRandom.NextDouble() * (newIntroSpawnMaxX - newIntroSpawnMinX));
            float y = newIntroSpawnMinY + (float)(_seededRandom.NextDouble() * (newIntroSpawnMaxY - newIntroSpawnMinY));
            float z = newIntroSpawnMinZ + (float)(_seededRandom.NextDouble() * (newIntroSpawnMaxZ - newIntroSpawnMinZ));
            candidate = new Vector3(x, y, z);

            bool overlaps = false;
            for (int p = 0; p < _placedSpheres.Count; p++)
            {
                float minDist = radius + _placedSpheres[p].radius;
                Vector2 flatCandidate = new Vector2(candidate.x, candidate.z);
                Vector2 flatPlaced    = new Vector2(_placedSpheres[p].center.x, _placedSpheres[p].center.z);
                if (Vector2.SqrMagnitude(flatCandidate - flatPlaced) < minDist * minDist)
                {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps)
                return candidate;
        }

        return candidate;
    }

    /// <summary> Returns the world rotation axis for rolling along the given movement direction. </summary>
    private Vector3 RollingAxis([Bridge.Ref] Vector3 moveDelta)
    {
        Vector3 axis = Vector3.Cross(Vector3.up, moveDelta.normalized);
        if (axis.sqrMagnitude < 0.0001f)
            axis = -Vector3.right;
        return axis.normalized;
    }

    /// <summary> Creates a tween that rotates the marble by the correct roll angle for a given distance over a given duration. </summary>
    private Tweener SpinTween(Transform t, [Bridge.Ref] Vector3 axis, float distance, float duration)
    {
        float angleDegrees = (distance / rollingRadius) * Mathf.Rad2Deg;
        Vector3 eulerSpin  = axis * angleDegrees;
        return t.DORotate(eulerSpin, duration, RotateMode.WorldAxisAdd).SetEase(Ease.Linear);
    }
#endregion
}