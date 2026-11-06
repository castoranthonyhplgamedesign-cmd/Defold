using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using DG.Tweening;
using UnityEngine.Serialization;

public class GameManager : MonoBehaviour
{
    #region Variables
    public static GameManager Instance;

    [Header("Hint References")]
    [SerializeField] private Transform handPointer;
    [SerializeField] private Renderer handRenderer;
    [SerializeField] public GameObject Board;
    [SerializeField] private GameObject[] highlight;
    private Material handMat;
    [FormerlySerializedAs("IsTutorialActive")]
    [HideInInspector] public bool IsHintActive = false;

    [Header("Hint Target")]
    [FormerlySerializedAs("chosenBrick")]
    [SerializeField, ReadOnly] private Brick hintedBrick;
    [SerializeField] private float hintDelay = 3.0f;
    [SerializeField] private float minHintMoveDistance = 0.65f;
    [SerializeField] private float hintDistancePerFreeCell = 0.75f;
    [SerializeField] private float maxHintMoveDistance = 1.6f;
    [SerializeField] private int hintMoveCheckCells = 4;
    [SerializeField] private int targetRouteCheckCells = 12;
    [SerializeField] private bool startTutorialOnBegin = true;
    [SerializeField] private float restartHintAfterInputDelay = 0.45f;
    [SerializeField] private int reverseHintMemoryTurns = 3;
    [SerializeField, ReadOnly] private Brick targetHintBrick;
    [SerializeField, ReadOnly] private Gate targetHintGate;
    [HideInInspector, SerializeField] private float hintTimer = .0f;
    private Vector3 hintMoveDirection;
    private Sequence hintLoopSequence;
    private Coroutine delayedHintRestart;
    private int hintTurn;
    private Brick lastHintedBrick;
    private Vector3 lastHintDirection;
    private readonly Dictionary<Brick, Vector3> recentHintDirectionsByBrick = new Dictionary<Brick, Vector3>();
    private readonly Dictionary<Brick, int> recentHintTurnsByBrick = new Dictionary<Brick, int>();

    [Header("Optional Starting Hint")]
    [FormerlySerializedAs("HasUsedStartingBrick")]
    [HideInInspector] public bool HasUsedStartingHint = false;
    [SerializeField] private Brick startingBrick;
    [SerializeField] private Vector3 startingDirection;

    private readonly Vector3[] directions =
    {
        Vector3.forward,
        Vector3.back,
        Vector3.left,
        Vector3.right
    };

    private struct HintCandidate
    {
        public Brick HintBrick;
        public Brick TargetBrick;
        public Gate TargetGate;
        public Vector3 Direction;
    }
    #endregion

    #region Private Methods
    private void Awake()
    {
        Instance = this;
        handPointer.gameObject.SetActive(false);
    }

    private void Start()
    {
        handMat = handRenderer.material;
        HasUsedStartingHint = false;
        IsHintActive = true;
        hintTimer = startTutorialOnBegin ? 0f : hintDelay;
        if (startTutorialOnBegin)
            StartCoroutine(StartOpeningTutorial());
    }

    private void Update()
    {
        if (startingBrick && !HasUsedStartingHint)
        {
            if (!startingBrick.gameObject.activeSelf)
            {
                HasUsedStartingHint = true;
                startingBrick = null;
                ClearCurrentHintTarget();
                handPointer.gameObject.SetActive(false);
                StopGateHighlights();
            }
        }
        if (!IsHintActive) return;
        hintTimer += Time.deltaTime;
        if (hintTimer >= hintDelay)
        {
            hintTimer = 0;
            TryFindValidMove();
        }
        if (hintedBrick != null && !handPointer.gameObject.activeSelf)
        {
            StartHintHandAnimationLoop();
            HighlightGateColor();
        }
    }
    #endregion

    #region Hint Logic
    private IEnumerator StartOpeningTutorial()
    {
        yield return null;

        if (!IsHintActive || hintedBrick != null || handPointer.gameObject.activeSelf) yield break;

        TryFindValidMove();
        if (hintedBrick == null) yield break;

        hintTimer = 0f;
        StartHintHandAnimationLoop();
        HighlightGateColor();
    }

    private void HighlightGateColor()
    {
        Brick highlightedTarget = targetHintBrick != null && targetHintBrick.gameObject.activeInHierarchy
            ? targetHintBrick
            : hintedBrick;

        if (highlightedTarget == null) return;
        StartGateHighlight((int)highlightedTarget.BrickColor);
    }

    private void StartGateHighlight(int index)
    {
        if (highlight == null || index < 0 || index >= highlight.Length || highlight[index] == null) return;

        GameObject target = highlight[index];
        MeshRenderer renderer = target.GetComponent<MeshRenderer>();
        if (renderer == null) return;

        Material material = renderer.material;
        material.DOKill();
        target.transform.DOKill();
        target.SetActive(true);
        SetMaterialAlpha(material, 0f);
        material.DOFade(0.5f, 0.5f).SetLoops(-1, LoopType.Yoyo);
    }

    private void StopGateHighlights()
    {
        if (highlight == null) return;

        foreach (var h in highlight)
        {
            if (h == null) continue;

            MeshRenderer renderer = h.GetComponent<MeshRenderer>();
            if (renderer != null)
            {
                Material material = renderer.material;
                material.DOKill();
                SetMaterialAlpha(material, 0f);
            }

            h.transform.DOKill();
            h.SetActive(false);
        }
    }

    private void SetMaterialAlpha(Material material, float alpha)
    {
        Color color = material.color;
        color.a = alpha;
        material.color = color;
    }

    private void TryFindValidMove()
    {
        if (!HasUsedStartingHint)
        {
            if (startingBrick != null && startingBrick.gameObject.activeInHierarchy)
            {
                Gate startingGate = GetBestMatchingGate(startingBrick);
                SetHint(
                    startingBrick,
                    new Vector3(
                        Mathf.Round(startingDirection.x),
                        0,
                        Mathf.Round(startingDirection.z)
                    ),
                    startingBrick,
                    startingGate
                );
                HighlightGateColor();
                return;
            }

            HasUsedStartingHint = true;
            startingBrick = null;
            ClearCurrentTargetPlan();
        }
        if (hintedBrick != null) return;
        ClearCurrentHintTarget();

        if (TryFindTargetedHint(out HintCandidate bestCandidate))
        {
            SetHint(
                bestCandidate.HintBrick,
                bestCandidate.Direction,
                bestCandidate.TargetBrick,
                bestCandidate.TargetGate
            );
        }
        else
        {
            ClearCurrentTargetPlan();
        }
    }

    private void SetHint(Brick hintBrick, Vector3 direction, Brick targetBrick, Gate targetGate)
    {
        hintedBrick = hintBrick;
        hintMoveDirection = GetGridDirection(direction);
        targetHintBrick = targetBrick;
        targetHintGate = targetGate;
        lastHintedBrick = hintBrick;
        lastHintDirection = hintMoveDirection;
        hintTurn++;
        recentHintDirectionsByBrick[hintBrick] = hintMoveDirection;
        recentHintTurnsByBrick[hintBrick] = hintTurn;
    }

    private void ClearCurrentHintTarget()
    {
        hintedBrick = null;
        hintMoveDirection = Vector3.zero;
        ClearCurrentTargetPlan();
    }

    private void ClearCurrentTargetPlan()
    {
        targetHintBrick = null;
        targetHintGate = null;
    }

    private void CancelDelayedHintRestart()
    {
        if (delayedHintRestart == null) return;

        StopCoroutine(delayedHintRestart);
        delayedHintRestart = null;
    }

    private void QueueDelayedHintRestart()
    {
        CancelDelayedHintRestart();
        delayedHintRestart = StartCoroutine(RestartHintAfterBoardSettles());
    }

    private IEnumerator RestartHintAfterBoardSettles()
    {
        if (restartHintAfterInputDelay > 0f)
            yield return new WaitForSeconds(restartHintAfterInputDelay);

        delayedHintRestart = null;
        if (!IsHintActive || hintedBrick != null || handPointer.gameObject.activeSelf)
            yield break;

        TryFindValidMove();
        if (hintedBrick == null)
            yield break;

        hintTimer = 0f;
        StartHintHandAnimationLoop();
        HighlightGateColor();
    }

    private bool TryFindTargetedHint(out HintCandidate bestCandidate)
    {
        bestCandidate = default;
        if (TryFindSubmitHint(out bestCandidate))
            return true;

        if (TryFindDirectClearHint(out bestCandidate))
            return true;

        return TryFindClosestBlackWhiteTargetHint(out bestCandidate);
    }

    private bool TryFindSubmitHint(out HintCandidate bestCandidate)
    {
        bestCandidate = default;
        bool hasCandidate = false;
        float closestDistance = float.MaxValue;
        Transform boardTransform = Board.transform;
        int childCount = boardTransform.childCount;
        for (int i = 0; i < childCount; i++)
        {
            GameObject brickObj = boardTransform.GetChild(i).gameObject;
            if (brickObj == null || !brickObj.activeInHierarchy)
                continue;
            if (!brickObj.TryGetComponent(out Brick brick))
                continue;

            Gate matchingGate = GetBestMatchingGate(brick);
            if (matchingGate == null || !matchingGate.CanAccept(brick))
                continue;

            Vector3 submitDirection = GetGridDirection(matchingGate.acceptDirection);
            if (submitDirection == Vector3.zero)
                continue;

            float distance = GetDistanceToGate(brick, matchingGate);
            if (hasCandidate && distance >= closestDistance)
                continue;
            if (!CreateHintCandidate(brick, submitDirection, brick, matchingGate, out HintCandidate candidate))
                continue;

            bestCandidate = candidate;
            closestDistance = distance;
            hasCandidate = true;
        }

        return hasCandidate;
    }

    private bool TryFindDirectClearHint(out HintCandidate bestCandidate)
    {
        bestCandidate = default;
        bool hasCandidate = false;
        float closestDistance = float.MaxValue;
        Transform boardTransform = Board.transform;
        int childCount = boardTransform.childCount;
        for (int i = 0; i < childCount; i++)
        {
            GameObject brickObj = boardTransform.GetChild(i).gameObject;
            if (brickObj == null || !brickObj.activeInHierarchy)
                continue;
            if (!brickObj.TryGetComponent(out Brick brick))
                continue;

            Gate matchingGate = GetBestMatchingGate(brick);
            if (matchingGate == null)
                continue;
            if (!TryGetDirectGateRoute(brick, matchingGate, out Vector3 routeDirection, out int routeSteps))
                continue;
            if (!CanBrickMove(brick, routeDirection))
                continue;
            if (!IsRouteClear(brick, routeDirection, routeSteps))
                continue;
            if (IsRecentReverseHint(brick, routeDirection))
                continue;

            float distance = GetDistanceToGate(brick, matchingGate);
            if (hasCandidate && distance >= closestDistance)
                continue;

            if (!CreateHintCandidate(brick, routeDirection, brick, matchingGate, out HintCandidate candidate))
                continue;

            bestCandidate = candidate;
            closestDistance = distance;
            hasCandidate = true;
        }

        return hasCandidate;
    }

    private bool TryFindClosestBlackWhiteTargetHint(out HintCandidate bestCandidate)
    {
        bestCandidate = default;
        bool hasCandidate = false;
        float closestDistance = float.MaxValue;
        Transform boardTransform = Board.transform;
        int childCount = boardTransform.childCount;
        for (int i = 0; i < childCount; i++)
        {
            GameObject brickObj = boardTransform.GetChild(i).gameObject;
            if (brickObj == null || !brickObj.activeInHierarchy)
                continue;
            if (!brickObj.TryGetComponent(out Brick brick))
                continue;
            if (!IsBlackOrWhiteHintBrick(brick))
                continue;

            Gate matchingGate = GetBestMatchingGate(brick);
            if (matchingGate == null)
                continue;
            if (!TryFindHintForTarget(brick, matchingGate, out HintCandidate candidate))
                continue;

            float distance = GetDistanceToGate(brick, matchingGate);
            if (!hasCandidate || distance < closestDistance)
            {
                closestDistance = distance;
                bestCandidate = candidate;
                hasCandidate = true;
            }
        }

        return hasCandidate;
    }

    private bool TryFindHintForTarget(Brick targetBrick, Gate targetGate, out HintCandidate candidate)
    {
        if (TryFindTargetPassHint(targetBrick, targetGate, out candidate))
            return true;

        if (TryFindTargetAlignmentHint(targetBrick, targetGate, out candidate))
            return true;

        if (TryFindAnyTargetMove(targetBrick, targetGate, out candidate))
            return true;

        candidate = default;
        return false;
    }

    private bool IsBlackOrWhiteHintBrick(Brick brick)
    {
        return brick.BrickColor == BrickColor.Black || brick.BrickColor == BrickColor.White;
    }

    private bool TryFindTargetPassHint(Brick targetBrick, Gate targetGate, out HintCandidate candidate)
    {
        candidate = default;
        Vector3 routeDirection = GetRouteDirection(targetBrick, targetGate);
        if (routeDirection == Vector3.zero)
            return false;

        if (CanBrickMove(targetBrick, routeDirection) && !IsRecentReverseHint(targetBrick, routeDirection))
            return CreateHintCandidate(targetBrick, routeDirection, targetBrick, targetGate, out candidate);

        return TryFindRouteBlockerHint(targetBrick, targetGate, routeDirection, out candidate);
    }

    private bool TryFindTargetAlignmentHint(Brick targetBrick, Gate targetGate, out HintCandidate candidate)
    {
        candidate = default;
        Vector3[] orderedDirections = GetDirectionsTowardGateOrdered(targetBrick, targetGate);
        for (int i = 0; i < orderedDirections.Length; i++)
        {
            Vector3 direction = orderedDirections[i];
            if (direction == Vector3.zero)
                continue;
            if (!CanBrickMove(targetBrick, direction))
                continue;
            if (!MoveGetsCloserToGate(targetBrick, targetGate, direction))
                continue;
            if (IsRecentReverseHint(targetBrick, direction))
                continue;

            return CreateHintCandidate(targetBrick, direction, targetBrick, targetGate, out candidate);
        }

        for (int i = 0; i < orderedDirections.Length; i++)
        {
            Vector3 direction = orderedDirections[i];
            if (direction == Vector3.zero)
                continue;
            if (CanBrickMove(targetBrick, direction))
                continue;
            if (TryFindRouteBlockerHint(targetBrick, targetGate, direction, out candidate))
                return true;
        }

        return false;
    }

    private bool TryFindAnyTargetMove(Brick targetBrick, Gate targetGate, out HintCandidate candidate)
    {
        candidate = default;
        for (int i = 0; i < directions.Length; i++)
        {
            Vector3 direction = directions[i];
            if (CanBrickMove(targetBrick, direction) && !IsRecentReverseHint(targetBrick, direction))
                return CreateHintCandidate(targetBrick, direction, targetBrick, targetGate, out candidate);
        }

        return false;
    }

    private bool TryFindRouteBlockerHint(
        Brick targetBrick,
        Gate targetGate,
        Vector3 routeDirection,
        out HintCandidate candidate)
    {
        candidate = default;
        Vector3 gridDirection = GetGridDirection(routeDirection);
        if (gridDirection == Vector3.zero)
            return false;

        List<Brick> checkedBlockers = new List<Brick>();
        BrickCell[] targetCells = targetBrick.GetComponentsInChildren<BrickCell>();
        int routeSteps = GetRouteStepLimit(targetBrick, targetGate, gridDirection);
        for (int step = 1; step <= routeSteps; step++)
        {
            for (int i = 0; i < targetCells.Length; i++)
            {
                Brick blocker = GetBlockingBrickAtPosition(
                    targetCells[i].transform.position + gridDirection * step,
                    targetBrick
                );
                if (blocker == null || checkedBlockers.Contains(blocker))
                    continue;

                checkedBlockers.Add(blocker);
                if (TryFindBlockerClearDirection(blocker, targetBrick, targetGate, gridDirection, out Vector3 clearDirection))
                    return CreateHintCandidate(blocker, clearDirection, targetBrick, targetGate, out candidate);
            }
        }

        return false;
    }

    private bool TryFindBlockerClearDirection(
        Brick blocker,
        Brick targetBrick,
        Gate targetGate,
        Vector3 routeDirection,
        out Vector3 clearDirection)
    {
        clearDirection = Vector3.zero;
        int routeSteps = GetRouteStepLimit(targetBrick, targetGate, routeDirection);
        int currentOverlap = CountRouteOverlap(blocker, targetBrick, routeDirection, routeSteps, Vector3.zero);
        Vector3[] clearDirections = GetBlockerClearDirectionsOrdered(blocker, targetBrick, routeDirection);

        if (TryChooseBlockerClearDirection(blocker, targetBrick, routeDirection, routeSteps, currentOverlap, clearDirections, true, out clearDirection))
            return true;

        return TryChooseBlockerClearDirection(blocker, targetBrick, routeDirection, routeSteps, currentOverlap, clearDirections, false, out clearDirection);
    }

    private bool TryChooseBlockerClearDirection(
        Brick blocker,
        Brick targetBrick,
        Vector3 routeDirection,
        int routeSteps,
        int currentOverlap,
        Vector3[] clearDirections,
        bool requireOverlapReduction,
        out Vector3 clearDirection)
    {
        clearDirection = Vector3.zero;
        for (int i = 0; i < clearDirections.Length; i++)
        {
            Vector3 direction = GetGridDirection(clearDirections[i]);
            if (direction == Vector3.zero)
                continue;
            if (!CanBrickMove(blocker, direction))
                continue;
            if (IsRecentReverseHint(blocker, direction))
                continue;
            if (requireOverlapReduction && CountRouteOverlap(blocker, targetBrick, routeDirection, routeSteps, direction) >= currentOverlap)
                continue;

            clearDirection = direction;
            return true;
        }

        return false;
    }

    private bool CreateHintCandidate(
        Brick hintBrick,
        Vector3 direction,
        Brick targetBrick,
        Gate targetGate,
        out HintCandidate candidate)
    {
        candidate = default;
        Vector3 gridDirection = GetGridDirection(direction);
        if (hintBrick == null || targetBrick == null || gridDirection == Vector3.zero)
            return false;

        candidate = new HintCandidate
        {
            HintBrick = hintBrick,
            TargetBrick = targetBrick,
            TargetGate = targetGate,
            Direction = gridDirection
        };
        return true;
    }

    private bool HasAnyValidMove(Brick brick)
    {
        for (int i = 0; i < directions.Length; i++)
        {
            if (CanBrickMove(brick, directions[i]))
                return true;
        }

        return false;
    }

    private bool IsRouteClear(Brick targetBrick, Vector3 routeDirection, int routeSteps)
    {
        Vector3 gridDirection = GetGridDirection(routeDirection);
        if (gridDirection == Vector3.zero)
            return false;

        BrickCell[] targetCells = targetBrick.GetComponentsInChildren<BrickCell>();
        for (int step = 1; step <= routeSteps; step++)
        {
            for (int i = 0; i < targetCells.Length; i++)
            {
                GridSlot slot = BoardManager.Instance.GetSlotAtPosition(targetCells[i].transform.position + gridDirection * step);
                if (slot == null)
                    return false;
                if (slot.IsOccupied && slot.occupyingBrick != targetBrick)
                    return false;
            }
        }

        return true;
    }

    private bool HasRouteBlocker(Brick targetBrick, Gate targetGate, Vector3 routeDirection)
    {
        Vector3 gridDirection = GetGridDirection(routeDirection);
        if (gridDirection == Vector3.zero)
            return false;

        BrickCell[] targetCells = targetBrick.GetComponentsInChildren<BrickCell>();
        int routeSteps = GetRouteStepLimit(targetBrick, targetGate, gridDirection);
        for (int step = 1; step <= routeSteps; step++)
        {
            for (int i = 0; i < targetCells.Length; i++)
            {
                if (GetBlockingBrickAtPosition(targetCells[i].transform.position + gridDirection * step, targetBrick) != null)
                    return true;
            }
        }

        return false;
    }

    private Gate GetBestMatchingGate(Brick brick)
    {
        Vector3 brickCenter = GetBrickCenter(brick);
        Gate bestGate = null;
        float bestDist = float.MaxValue;
        foreach (var gate in Gate.allGates)
        {
            if (gate == null) continue;
            if (!gate.MatchesColor(brick.BrickColor)) continue;

            float dist = GetDistanceToGate(brickCenter, gate);
            if (dist < bestDist)
            {
                bestDist = dist;
                bestGate = gate;
            }
        }

        return bestGate;
    }

    private Vector3 GetRouteDirection(Brick targetBrick, Gate targetGate)
    {
        if (TryGetDirectGateRoute(targetBrick, targetGate, out Vector3 routeDirection, out _))
            return routeDirection;

        return GetDirectionToGate(targetBrick, targetGate);
    }

    private bool TryGetDirectGateRoute(Brick targetBrick, Gate targetGate, out Vector3 routeDirection, out int stepsToGate)
    {
        routeDirection = Vector3.zero;
        stepsToGate = 0;
        if (targetGate == null || targetGate.gateSlots == null || targetGate.gateSlots.Count == 0)
            return false;

        int bestSteps = int.MaxValue;
        for (int i = 0; i < directions.Length; i++)
        {
            Vector3 direction = directions[i];
            if (!MoveGetsCloserToGate(targetBrick, targetGate, direction))
                continue;
            if (!TryGetStepsToGateSlots(targetBrick, targetGate, direction, out int steps))
                continue;
            if (steps >= bestSteps)
                continue;

            bestSteps = steps;
            stepsToGate = steps;
            routeDirection = direction;
        }

        return routeDirection != Vector3.zero;
    }

    private bool TryGetStepsToGateSlots(Brick targetBrick, Gate targetGate, Vector3 direction, out int stepsToGate)
    {
        stepsToGate = 0;
        Vector3 gridDirection = GetGridDirection(direction);
        if (gridDirection == Vector3.zero || targetGate == null || targetGate.gateSlots == null)
            return false;

        BrickCell[] cells = targetBrick.GetComponentsInChildren<BrickCell>();
        int maxSteps = Mathf.Max(1, targetRouteCheckCells);
        for (int steps = 1; steps <= maxSteps; steps++)
        {
            bool allCellsReachGate = true;
            for (int i = 0; i < cells.Length; i++)
            {
                GridSlot slot = BoardManager.Instance.GetSlotAtPosition(cells[i].transform.position + gridDirection * steps);
                if (slot == null || !targetGate.gateSlots.Contains(slot))
                {
                    allCellsReachGate = false;
                    break;
                }
            }

            if (!allCellsReachGate)
                continue;

            stepsToGate = steps;
            return true;
        }

        return false;
    }

    private int GetRouteStepLimit(Brick targetBrick, Gate targetGate, Vector3 routeDirection)
    {
        int routeSteps = Mathf.Max(hintMoveCheckCells, targetRouteCheckCells);
        if (TryGetStepsToGateSlots(targetBrick, targetGate, routeDirection, out int stepsToGate))
            routeSteps = Mathf.Min(routeSteps, stepsToGate);

        return Mathf.Max(1, routeSteps);
    }

    private Vector3 GetDirectionToGate(Brick brick, Gate gate)
    {
        Vector3 brickCenter = GetBrickCenter(brick);
        return GetGridDirection(GetClosestGatePosition(brickCenter, gate) - brickCenter);
    }

    private Vector3[] GetDirectionsTowardGateOrdered(Brick brick, Gate gate)
    {
        Vector3 brickCenter = GetBrickCenter(brick);
        Vector3 delta = GetClosestGatePosition(brickCenter, gate) - brickCenter;
        delta.y = 0f;
        Vector3 xDirection = Mathf.Abs(delta.x) > 0.05f
            ? (delta.x >= 0f ? Vector3.right : Vector3.left)
            : Vector3.zero;
        Vector3 zDirection = Mathf.Abs(delta.z) > 0.05f
            ? (delta.z >= 0f ? Vector3.forward : Vector3.back)
            : Vector3.zero;

        return Mathf.Abs(delta.x) >= Mathf.Abs(delta.z)
            ? new[] { xDirection, zDirection }
            : new[] { zDirection, xDirection };
    }

    private Vector3[] GetBlockerClearDirectionsOrdered(Brick blocker, Brick targetBrick, Vector3 routeDirection)
    {
        Vector3 blockerOffset = GetBrickCenter(blocker) - GetBrickCenter(targetBrick);
        if (Mathf.Abs(routeDirection.x) > 0f)
        {
            Vector3 primary = blockerOffset.z >= 0f ? Vector3.forward : Vector3.back;
            return new[] { primary, -primary, -routeDirection, routeDirection };
        }
        else
        {
            Vector3 primary = blockerOffset.x >= 0f ? Vector3.right : Vector3.left;
            return new[] { primary, -primary, -routeDirection, routeDirection };
        }
    }

    private bool MoveGetsCloserToGate(Brick brick, Gate gate, Vector3 direction)
    {
        Vector3 gridDirection = GetGridDirection(direction);
        if (gridDirection == Vector3.zero)
            return false;

        Vector3 center = GetBrickCenter(brick);
        return GetDistanceToGate(center + gridDirection, gate) < GetDistanceToGate(center, gate) - 0.01f;
    }

    private float GetDistanceToGate(Brick brick, Gate gate)
    {
        return GetDistanceToGate(GetBrickCenter(brick), gate);
    }

    private float GetDistanceToGate(Vector3 brickCenter, Gate gate)
    {
        if (gate == null)
            return float.MaxValue;

        float bestDistance = (gate.VfxPosition - brickCenter).sqrMagnitude;
        if (gate.gateSlots == null)
            return bestDistance;

        for (int i = 0; i < gate.gateSlots.Count; i++)
        {
            GridSlot slot = gate.gateSlots[i];
            if (slot == null)
                continue;

            float slotDistance = (slot.WorldPosition - brickCenter).sqrMagnitude;
            if (slotDistance < bestDistance)
                bestDistance = slotDistance;
        }

        return bestDistance;
    }

    private Vector3 GetClosestGatePosition(Vector3 brickCenter, Gate gate)
    {
        if (gate == null || gate.gateSlots == null || gate.gateSlots.Count == 0)
            return gate != null ? gate.VfxPosition : brickCenter;

        Vector3 closestPosition = gate.VfxPosition;
        float closestDistance = (closestPosition - brickCenter).sqrMagnitude;
        for (int i = 0; i < gate.gateSlots.Count; i++)
        {
            GridSlot slot = gate.gateSlots[i];
            if (slot == null)
                continue;

            float slotDistance = (slot.WorldPosition - brickCenter).sqrMagnitude;
            if (slotDistance < closestDistance)
            {
                closestDistance = slotDistance;
                closestPosition = slot.WorldPosition;
            }
        }

        return closestPosition;
    }

    private Brick GetBlockingBrickAtPosition(Vector3 worldPosition, Brick ignoredBrick)
    {
        GridSlot slot = BoardManager.Instance.GetSlotAtPosition(worldPosition);
        if (slot == null || !slot.IsOccupied || slot.occupyingBrick == ignoredBrick)
            return null;
        if (!slot.occupyingBrick.gameObject.activeInHierarchy)
            return null;

        return slot.occupyingBrick;
    }

    private int CountRouteOverlap(Brick brick, Brick targetBrick, Vector3 routeDirection, int routeSteps, Vector3 brickOffset)
    {
        int overlap = 0;
        BrickCell[] brickCells = brick.GetComponentsInChildren<BrickCell>();
        BrickCell[] targetCells = targetBrick.GetComponentsInChildren<BrickCell>();
        Vector3 gridDirection = GetGridDirection(routeDirection);
        for (int i = 0; i < brickCells.Length; i++)
        {
            GridSlot brickSlot = BoardManager.Instance.GetSlotAtPosition(brickCells[i].transform.position + brickOffset);
            if (brickSlot == null)
                continue;

            bool overlapsRoute = false;
            for (int step = 1; step <= routeSteps && !overlapsRoute; step++)
            {
                for (int t = 0; t < targetCells.Length; t++)
                {
                    GridSlot routeSlot = BoardManager.Instance.GetSlotAtPosition(targetCells[t].transform.position + gridDirection * step);
                    if (routeSlot != null && routeSlot == brickSlot)
                    {
                        overlapsRoute = true;
                        break;
                    }
                }
            }

            if (overlapsRoute)
                overlap++;
        }

        return overlap;
    }

    private bool IsRecentReverseHint(Brick brick, Vector3 direction)
    {
        if (brick == null)
            return false;
        if (!recentHintDirectionsByBrick.TryGetValue(brick, out Vector3 recentDirection))
            return false;
        if (!recentHintTurnsByBrick.TryGetValue(brick, out int recentTurn))
            return false;
        if (hintTurn - recentTurn > Mathf.Max(1, reverseHintMemoryTurns))
            return false;

        Vector3 gridDirection = GetGridDirection(direction);
        return gridDirection != Vector3.zero && recentDirection != Vector3.zero && gridDirection == -recentDirection;
    }

    private Vector3 GetBrickCenter(Brick brick)
    {
        BrickCell[] cells = brick.GetComponentsInChildren<BrickCell>();
        if (cells == null || cells.Length == 0) return brick.transform.position;
        Vector3 sum = Vector3.zero;
        for (int i = 0; i < cells.Length; i++) sum += cells[i].transform.position;
        return sum / cells.Length;
    }

    private bool CanBrickMove(Brick brick, Vector3 direction)
    {
        BrickCell[] cells = brick.GetComponentsInChildren<BrickCell>();
        if (cells == null || cells.Length == 0)
            return false;
        for (int i = 0; i < cells.Length; i++)
        {
            Vector3 cellWorld = cells[i].transform.position;
            Vector3 targetPos = cellWorld + direction;
            GridSlot nextSlot = BoardManager.Instance.GetSlotAtPosition(targetPos);
            if (nextSlot == null)
                return false;
            if (nextSlot.IsOccupied && nextSlot.occupyingBrick != brick)
                return false;
        }

        return true;
    }

    private float GetDynamicHintMoveDistance(Brick brick, Vector3 direction)
    {
        int freeCells = CountFreeMoveCells(brick, direction);
        if (freeCells <= 0) return minHintMoveDistance;

        float scaledDistance = freeCells * hintDistancePerFreeCell;
        return Mathf.Clamp(scaledDistance, minHintMoveDistance, maxHintMoveDistance);
    }

    private int CountFreeMoveCells(Brick brick, Vector3 direction)
    {
        Vector3 unitDirection = GetGridDirection(direction);
        if (unitDirection == Vector3.zero) return 0;

        int maxCells = Mathf.Max(1, hintMoveCheckCells);
        int freeCells = 0;
        for (int cells = 1; cells <= maxCells; cells++)
        {
            if (!CanBrickMoveCells(brick, unitDirection, cells))
                break;

            freeCells = cells;
        }

        return freeCells;
    }

    private bool CanBrickMoveCells(Brick brick, Vector3 direction, int cellsToMove)
    {
        BrickCell[] cells = brick.GetComponentsInChildren<BrickCell>();
        if (cells == null || cells.Length == 0)
            return false;

        Vector3 offset = direction * cellsToMove;
        for (int i = 0; i < cells.Length; i++)
        {
            Vector3 targetPos = cells[i].transform.position + offset;
            GridSlot nextSlot = BoardManager.Instance.GetSlotAtPosition(targetPos);
            if (nextSlot == null)
                return false;
            if (nextSlot.IsOccupied && nextSlot.occupyingBrick != brick)
                return false;
        }

        return true;
    }

    private Vector3 GetGridDirection(Vector3 direction)
    {
        direction.y = 0f;
        if (direction.sqrMagnitude < 0.0001f) return Vector3.zero;

        return Mathf.Abs(direction.x) >= Mathf.Abs(direction.z)
            ? (direction.x >= 0f ? Vector3.right : Vector3.left)
            : (direction.z >= 0f ? Vector3.forward : Vector3.back);
    }
    #endregion

    #region Hint Animation
    private void StartHintHandAnimationLoop()
    {
        handPointer.gameObject.SetActive(true);
        hintLoopSequence?.Kill();
        hintLoopSequence = DOTween.Sequence().SetLoops(-1);
        Vector3 brickPos = GetBrickCenter(hintedBrick) + Vector3.up * 0.2f;
        Vector3 targetPos = brickPos + (GetGridDirection(hintMoveDirection) * GetDynamicHintMoveDistance(hintedBrick, hintMoveDirection));
        handPointer.position = brickPos;
        SetAlpha(0f);
        float totalDuration = 1.5f;
        float fadeInDuration = 0.25f;
        float moveDuration = 0.75f;
        float intervalDuration = 0.1f;
        float fadeOutDuration = totalDuration - (fadeInDuration + moveDuration + intervalDuration);
        hintLoopSequence.Append(DOTween.To(() => GetAlpha(), x => SetAlpha(x), 1f, fadeInDuration));
        hintLoopSequence.Append(handPointer.DOMove(targetPos, moveDuration).SetEase(Ease.InOutSine));
        hintLoopSequence.AppendInterval(intervalDuration);
        hintLoopSequence.Append(DOTween.To(() => GetAlpha(), x => SetAlpha(x), 0f, fadeOutDuration));
        hintLoopSequence.AppendCallback(() =>
        {
            if (hintedBrick != null)
            {
                handPointer.position = GetBrickCenter(hintedBrick) + Vector3.up * 0.2f;
            }
        });
    }

    private void SetAlpha(float value)
    {
        Color c = handMat.color;
        c.a = value;
        handMat.color = c;
    }

    private float GetAlpha()
    {
        return handMat.color.a;
    }
    #endregion

    #region Public API
    public void StopHint()
    {
        CancelDelayedHintRestart();
        hintTimer = 0f;
        if (hintLoopSequence != null && hintLoopSequence.IsActive())
            hintLoopSequence.Kill();
        handPointer.gameObject.SetActive(false);
        IsHintActive = false;
        HasUsedStartingHint = true;
        ClearCurrentHintTarget();
        StopGateHighlights();
    }

    public void StartHint()
    {
        CancelDelayedHintRestart();
        hintTimer = 0f;
        if (hintLoopSequence != null && hintLoopSequence.IsActive())
            hintLoopSequence.Kill();
        handPointer.gameObject.SetActive(false);
        StopGateHighlights();
        IsHintActive = true;
        HasUsedStartingHint = true;
        ClearCurrentHintTarget();
        QueueDelayedHintRestart();
    }

    public void StopTutorial()
    {
        StopHint();
    }

    public void StartTutorial()
    {
        StartHint();
    }
    #endregion
}
