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
    [HideInInspector, SerializeField] private float hintTimer = .0f;
    private Vector3 hintMoveDirection;
    private Sequence hintLoopSequence;

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
        hintTimer = hintDelay;
    }

    private void Update()
    {
        if (startingBrick && !HasUsedStartingHint)
        {
            if (!startingBrick.gameObject.activeSelf)
            {
                HasUsedStartingHint = true;
                startingBrick = null;
                hintedBrick = null;
                handPointer.gameObject.SetActive(false);
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
    private void HighlightGateColor()
    {
        //Red
        if (hintedBrick.BrickColor == BrickColor.Red)
        {
            StartGateHighlight(0);
        }
        //Green
        if (hintedBrick.BrickColor == BrickColor.Green)
        {
            StartGateHighlight(1);
        }
        //Blue
        if (hintedBrick.BrickColor == BrickColor.Blue)
        {
            StartGateHighlight(2);
        }
        //Yellow
        if (hintedBrick.BrickColor == BrickColor.Yellow)
        {
            StartGateHighlight(3);
        }
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
            hintedBrick = startingBrick;
            hintMoveDirection = new Vector3(
                    Mathf.Round(startingDirection.x),
                    0,
                    Mathf.Round(startingDirection.z)
                ).normalized;
            HighlightGateColor();
            return;
        }
        if (hintedBrick != null) return;
        hintedBrick = null;
        Transform boardTransform = Board.transform;
        int childCount = boardTransform.childCount;
        GameObject[] boardBricks = new GameObject[childCount];
        for (int i = 0; i < childCount; i++)
        {
            boardBricks[i] = boardTransform.GetChild(i).gameObject;
        }
        if (boardBricks.Length == 0)
            return;
        for (int i = boardBricks.Length - 1; i > 0; i--)
        {
            int rand = Random.Range(0, i + 1);
            (boardBricks[i], boardBricks[rand]) = (boardBricks[rand], boardBricks[i]);
        }
        foreach (var brickObj in boardBricks)
        {
            if (brickObj == null || !brickObj.activeInHierarchy)
                continue;
            if (!brickObj.TryGetComponent(out Brick brick))
                continue;
            Vector3 gateDir = GetDirectionToMatchingGate(brick);
            if (gateDir != Vector3.zero && CanBrickMove(brick, gateDir))
            {
                hintedBrick = brick;
                hintMoveDirection = gateDir;
                return;
            }
            ShuffleDirections();
            for (int d = 0; d < directions.Length; d++)
            {
                if (CanBrickMove(brick, directions[d]))
                {
                    hintedBrick = brick;
                    hintMoveDirection = directions[d];
                    return;
                }
            }
        }
    }

    private Vector3 GetDirectionToMatchingGate(Brick brick)
    {
        Vector3 brickCenter = GetBrickCenter(brick);
        Gate bestGate = null;
        float bestDist = float.MaxValue;
        foreach (var gate in Gate.allGates)
        {
            if (gate == null) continue;
            if (!gate.MatchesColor(brick.brickColor)) continue;
            float dist = (gate.VfxPosition - brickCenter).sqrMagnitude;
            if (dist < bestDist)
            {
                bestDist = dist;
                bestGate = gate;
            }
        }
        if (bestGate == null) return Vector3.zero;
        Vector3 delta = bestGate.VfxPosition - brickCenter;
        Vector3 primary = Mathf.Abs(delta.x) >= Mathf.Abs(delta.z)
            ? (delta.x >= 0 ? Vector3.right : Vector3.left)
            : (delta.z >= 0 ? Vector3.forward : Vector3.back);
        if (CanBrickMove(brick, primary)) return primary;
        Vector3 secondary = Mathf.Abs(delta.x) >= Mathf.Abs(delta.z)
            ? (delta.z >= 0 ? Vector3.forward : Vector3.back)
            : (delta.x >= 0 ? Vector3.right : Vector3.left);
        if (CanBrickMove(brick, secondary)) return secondary;
        return Vector3.zero;
    }

    private Vector3 GetBrickCenter(Brick brick)
    {
        BrickCell[] cells = brick.GetComponentsInChildren<BrickCell>();
        if (cells == null || cells.Length == 0) return brick.transform.position;
        Vector3 sum = Vector3.zero;
        for (int i = 0; i < cells.Length; i++) sum += cells[i].transform.position;
        return sum / cells.Length;
    }

    private void ShuffleDirections()
    {
        for (int i = directions.Length - 1; i > 0; i--)
        {
            int rand = Random.Range(0, i + 1);
            Vector3 temp = directions[i];
            directions[i] = directions[rand];
            directions[rand] = temp;
        }
    }

    private bool CanBrickMove(Brick brick, [Bridge.Ref] Vector3 direction)
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
    #endregion

    #region Hint Animation
    private void StartHintHandAnimationLoop()
    {
        handPointer.gameObject.SetActive(true);
        hintLoopSequence?.Kill();
        hintLoopSequence = DOTween.Sequence().SetLoops(-1);
        float directionAmplitude = 3.0f;
        Vector3 brickPos = hintedBrick.transform.position + Vector3.up * 0.2f;
        Vector3 targetPos = brickPos + (hintMoveDirection * directionAmplitude);
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
                handPointer.position = hintedBrick.transform.position + Vector3.up * 0.2f;
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
        hintTimer = 0f;
        if (hintLoopSequence != null && hintLoopSequence.IsActive())
            hintLoopSequence.Kill();
        handPointer.gameObject.SetActive(false);
        IsHintActive = false;
        HasUsedStartingHint = true;
        hintedBrick = null;
        StopGateHighlights();
    }

    public void StartHint()
    {
        hintTimer = 0f;
        if (hintLoopSequence != null && hintLoopSequence.IsActive())
            hintLoopSequence.Kill();
        handPointer.gameObject.SetActive(false);
        IsHintActive = true;
        HasUsedStartingHint = true;
        hintedBrick = null;
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
