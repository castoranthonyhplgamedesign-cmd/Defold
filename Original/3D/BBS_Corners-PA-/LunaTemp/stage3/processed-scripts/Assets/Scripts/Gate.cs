using DG.Tweening;
using System.Collections.Generic;
using UnityEngine;

public class Gate : MonoBehaviour
{
    #region Variables
    private const float ColorMatchTolerance = 0.0015f;

    public Color gateColor;

    [Header("Gate Slots")]
    public List<GridSlot> gateSlots = new List<GridSlot>();
    public static List<Gate> allGates = new List<Gate>();

    [Header("Detection")]
    public LayerMask GridSlotLayer;
    public Vector3 boxSize = new Vector3(2f, 1f, 2f);
    public Vector3 boxPosition = Vector3.zero;
    public Vector3 acceptDirection = Vector3.forward;

    [Header("Parts")]
    [SerializeField] private Transform gate;

    [Header("Effects")]
    [SerializeField] private ParticleSystem[] vfxs;
    public Vector3 VfxPosition => vfxs != null && vfxs.Length > 0 && vfxs[0] != null ? vfxs[0].transform.position : transform.position;
    private bool isBouncing = false;
    private Tween autoLowerTween;
    private float offset = 1.0f;
    private float raiseDuration = 0.5f;
    private Vector3 originalLocalPos;
    private Vector3 gateOriginalLocalPos;
    private Quaternion gateOriginalLocalRot;
    #endregion

    #region Private Methods
    private void Awake()
    {
        allGates.Add(this);
        originalLocalPos = transform.localPosition;
    }

    private void Start()
    {
        FindNearbySlots();
        foreach (var vfx in vfxs) vfx.Stop();
        gateOriginalLocalPos = gate.localPosition;
        gateOriginalLocalRot = gate.localRotation;
    }

    private void OnDestroy()
    {
        allGates.Remove(this);
    }
    #endregion

    #region Public API
    public static void StartBounceMatchingGates([Bridge.Ref] Color color)
    {
        foreach (var gate in allGates)
        {
            if (gate.MatchesColor(color))
                gate.StartBounce();
        }
    }

    public static void StopBounceMatchingGates([Bridge.Ref] Color color)
    {
        foreach (var gate in allGates)
        {
            if (gate.MatchesColor(color))
                gate.StopBounce();
        }
    }

    public bool MatchesColor([Bridge.Ref] Color color)
    {
        return Mathf.Abs(gateColor.r - color.r) <= ColorMatchTolerance
            && Mathf.Abs(gateColor.g - color.g) <= ColorMatchTolerance
            && Mathf.Abs(gateColor.b - color.b) <= ColorMatchTolerance;
    }

    public bool CanAccept(Brick brick)
    {
        if (!MatchesColor(brick.brickColor)) return false;
        foreach (var cell in brick.GetComponentsInChildren<BrickCell>())
        {
            GridSlot slot = BoardManager.Instance.GetClosestSlot(cell.transform.position);
            if (slot == null) return false;
            if (!gateSlots.Contains(slot)) return false;
        }
        if (brick.IsBlockedInDirection(acceptDirection)) return false;
        return true;
    }

    public void Absorb(Brick brick)
    {
        brick.DisablePhysics();
        StopBounceMatchingGates(gateColor);
        autoLowerTween?.Kill();
        foreach (var vfx in vfxs) vfx.Play();
        AudioManager.Instance.PlaySFX("Crumple");
        Transform target = vfxs[0].transform;
        brick.transform.DOKill();
        Sequence suckSeq = DOTween.Sequence();
        suckSeq.Join(
            brick.transform.DOMove(target.position, 0.35f)
                .SetEase(Ease.InQuad)
        );
        suckSeq.Join(
            brick.transform.DOScale(0.1f, 0.35f)
                .SetEase(Ease.InQuad)
        );
        suckSeq.OnComplete(() =>
        {
            brick.gameObject.SetActive(false);
            //CameraManager.Instance.Shake(0.1f, 0.1f);
            BoardManager.Instance.CheckAllBricks();
            Lower();
        });
    }

    public void Lower()
    {
        transform.DOKill();
        autoLowerTween?.Kill();
        float riseOffset = offset;
        Sequence seq = DOTween.Sequence();
        seq.Append(
            transform.DOLocalMoveY(originalLocalPos.y + riseOffset, raiseDuration)
                .SetEase(Ease.OutCubic)
        );
        seq.Append(
            transform.DOLocalMoveY(originalLocalPos.y - offset, raiseDuration / 2)
                .SetEase(Ease.InCubic)
        );
        seq.Append(
            transform.DOLocalMoveY(originalLocalPos.y, raiseDuration)
                .SetEase(Ease.OutCubic)
        );
        seq.OnComplete(() =>
        {
            gate.localPosition = gateOriginalLocalPos;
            gate.localRotation = gateOriginalLocalRot;
            Invoke(nameof(CheckWin), 0.01f);
        });
    }

    public void StartBounce()
    {
        if (isBouncing) return;
        isBouncing = true;
        transform.DOKill();
        float riseOffset = offset;
        Sequence seq = DOTween.Sequence();
        seq.Append(
            transform.DOLocalMoveY(originalLocalPos.y + riseOffset, raiseDuration)
                .SetEase(Ease.OutCubic)
        );
        seq.Append(
            transform.DOLocalMoveY(originalLocalPos.y, raiseDuration)
                .SetEase(Ease.InCubic)
        );
        seq.OnComplete(() =>
        {
            isBouncing = false;
            gate.localPosition = gateOriginalLocalPos;
            gate.localRotation = gateOriginalLocalRot;
        });
    }

    public void StopBounce()
    {
        transform.DOKill();
        isBouncing = false;
        gate.localPosition = gateOriginalLocalPos;
        gate.localRotation = gateOriginalLocalRot;
    }
    #endregion

    #region Private Helpers
    private void FindNearbySlots()
    {
        gateSlots.Clear();
        Collider[] hits = Physics.OverlapBox(transform.TransformPoint(boxPosition), boxSize * 0.5f, transform.rotation, GridSlotLayer);
        foreach (var hit in hits)
        {
            GridSlot slot = hit.GetComponent<GridSlot>();
            if (slot != null)
                gateSlots.Add(slot);
        }
    }

    private void CheckWin()
    {
        BoardManager.Instance.CheckAllBricks();
    }
    #endregion

#if UNITY_EDITOR
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.cyan;
        Gizmos.matrix = Matrix4x4.TRS(
            transform.position,
            transform.rotation,
            Vector3.one
        );
        Gizmos.DrawWireCube(boxPosition, boxSize);
    }
#endif
}
