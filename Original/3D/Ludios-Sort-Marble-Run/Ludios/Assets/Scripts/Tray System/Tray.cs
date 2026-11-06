using System;
using System.Collections.Generic;
using DG.Tweening;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Represents a single tray in the scene with a fixed number of slots that marbles can occupy.
/// Each slot is a Transform position where a marble lands.
/// </summary>
public class Tray : MonoBehaviour
{
    #region Variables

    [Header("Tray Settings")]
    [Tooltip("The color identity of this tray.")]
    public TrayType trayColor;

    [Header("Wrong Color Feedback")]
    [Tooltip("Fail icon that pops in before the vignette flash.")]
    [SerializeField] private RectTransform failImage;

    [Tooltip("Full-screen vignette Image used for the wrong-color flash effect.")]
    [SerializeField] private Image vignetteImage;

    [Tooltip("Slot positions where marbles land. Assign 3 child Transforms.")]
    public Transform[] slotPoints = new Transform[3];

    /// <summary>
    /// Fired when every slot in this tray has been filled and all marbles have arrived.
    /// TrayManager subscribes to this to know when to advance the current tray.
    /// </summary>
    public event Action<Tray> OnTrayFilled;

    /// <summary>
    /// Fired each time a single marble finishes its journey and is confirmed as arrived.
    /// TutorialManager uses this to restart the idle countdown.
    /// </summary>
    public static event Action<Marble> OnMarbleArrived;

    /// <summary>
    /// Fired when a marble of the wrong color enters this tray.
    /// All MarbleColumns subscribe to this to lock every marble immediately.
    /// </summary>
    public static event Action OnWrongColorEntered;

    private int nextSlotIndex;
    private int arrivedCount;
    private List<Marble> arrivedMarbles = new List<Marble>();
    private TrayAnimation trayAnimation;

    #endregion

    #region Unity Methods
    private void Awake()
    {
        trayAnimation = GetComponent<TrayAnimation>();
    }
    #endregion

    #region Public Methods
    /// <summary>
    /// Reserves the next available slot and returns its Transform for animation targeting.
    /// Does NOT mark the marble as arrived — call ConfirmMarbleArrival after the animation.
    /// Returns null if the tray has no more slots to reserve.
    /// </summary>
    public Transform ReserveNextSlot()
    {
        if (nextSlotIndex >= slotPoints.Length)
        {
            Debug.LogWarning($"Tray {trayColor} is full — no available slots.");
            return null;
        }

        Transform slot = slotPoints[nextSlotIndex];
        nextSlotIndex++;
        return slot;
    }

    /// <summary>
    /// Called by a marble when its move animation finishes.
    /// Officially assigns the marble to this tray, checks color match,
    /// and if the tray is now full, plays the dump animation then fires OnTrayFilled.
    /// </summary>
    public void ConfirmMarbleArrival(Marble marble)
    {
        arrivedMarbles.Add(marble);
        arrivedCount++;

        OnMarbleArrived?.Invoke(marble);

        if (marble.marbleType.ToString() == trayColor.ToString())
            Debug.Log($"Correct color! {marble.marbleType} marble placed in {trayColor} tray.");
        else
        {
            Debug.LogWarning($"Wrong color! {marble.marbleType} marble placed in {trayColor} tray.");
            PlayWrongColorFeedback();
        }

        if (arrivedCount >= slotPoints.Length)
        {
            if (trayAnimation != null)
            {
                trayAnimation.PlayDump(arrivedMarbles, () =>
                {
                    arrivedMarbles.Clear();
                    OnTrayFilled?.Invoke(this);
                });
            }
            else
            {
                Debug.LogWarning($"[Tray] trayAnimation is null on {name} — skipping dump animation.");
                arrivedMarbles.Clear();
                OnTrayFilled?.Invoke(this);
            }
        }
    }

    /// <summary>
    /// Returns true if every slot has been reserved (no more slots available).
    /// </summary>
    public bool IsFull()
    {
        return nextSlotIndex >= slotPoints.Length;
    }

    /// <summary>
    /// Returns true if at least one slot is still available to reserve.
    /// </summary>
    public bool HasAvailableSlot()
    {
        return !IsFull();
    }
    #endregion

    #region Private Methods

    private void PlayWrongColorFeedback()
    {
        OnWrongColorEntered?.Invoke();

        if (vignetteImage == null)
        {
            Debug.LogWarning("[Tray] Vignette Image is not assigned — skipping flash effect.");
            EndCardManager.Instance.FadeInEndCard();
            return;
        }

        // Ensure vignette starts invisible
        vignetteImage.gameObject.SetActive(true);
        Color c = vignetteImage.color;
        c.a = 0f;
        vignetteImage.color = c;

        AudioManager.Instance.PlaySFX("GameOver");

        Sequence flashSeq = DOTween.Sequence();

        // Scale fail image in before flashing
        if (failImage != null)
        {
            failImage.gameObject.SetActive(true);
            failImage.localScale = Vector3.zero;
            flashSeq.Append(failImage.DOScale(Vector3.one, 0.3f).SetEase(Ease.OutBack));
        }

        // Flash 1
        flashSeq.Append(vignetteImage.DOFade(0.8f, 0.5f));
        flashSeq.Append(vignetteImage.DOFade(0f,   0.5f));
        // Flash 2
        flashSeq.Append(vignetteImage.DOFade(0.8f, 0.5f));
        flashSeq.Append(vignetteImage.DOFade(0f,   0.5f));

        // Pause before showing end card
        flashSeq.AppendInterval(0.5f);

        flashSeq.OnComplete(() =>
        {
            vignetteImage.gameObject.SetActive(false);
            if (failImage != null) failImage.gameObject.SetActive(false);
            EndCardManager.Instance.FadeInEndCard();
        });
    }

    #endregion
}
