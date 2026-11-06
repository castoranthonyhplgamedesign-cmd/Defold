using System.Collections;
using System.Collections.Generic;
using Core.Services;
using UnityEngine;

public class AudioManager : MonoBehaviour, IAudioService
{
    #region Variables
    public static AudioManager Instance { get; private set; }

    [Header("Library")]
    public AudioLibrary library;

    [Header("SFX Pool Settings")]
    public int sfxPoolSize = 10;

    private Queue<AudioSource> sfxPool = new Queue<AudioSource>();
    private AudioSource musicSource;
    private float musicVolume = 0.25f;
    private float sfxVolume = 1.0f;
    private bool _canPlaySounds = true;
    #endregion

    #region Private Methods
    private void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);

        // Create SFX sources
        for (int i = 0; i < sfxPoolSize; i++)
        {
            var go = new GameObject($"SFX_Source_{i}");
            go.transform.parent = transform;
            var src = go.AddComponent<AudioSource>();
            src.playOnAwake = false;
            src.loop = false;
            src.volume = sfxVolume;
            sfxPool.Enqueue(src);
        }

        // Create Music source
        var musicGo = new GameObject("Music_Source");
        musicGo.transform.parent = transform;
        musicSource = musicGo.AddComponent<AudioSource>();
        musicSource.playOnAwake = false;
        musicSource.loop = true;
        musicSource.volume = musicVolume;

        library.Initialize();

        ServicesLocator.Register<IAudioService>(this);
    }

    private void Start()
    {
        StartCoroutine(WaitOnTap());
    }

    private IEnumerator WaitOnTap()
    {
        yield return new WaitUntil(() => (Input.GetMouseButtonDown(0) || Input.touchCount > 0));
        _canPlaySounds = true;
    }

    private void OnDisable()
    {
        ServicesLocator.Unregister<IAudioService>();
    }
    #endregion

    #region Public API
    public void PlaySFX(string key, Vector3? position = null, float pitch = 1f)
    {
        if(!_canPlaySounds) return; // Prevent playing sounds before user interaction (mobile autoplay policy)

        if (!library.TryGetClip(key, out var entry) || entry.channel != AudioChannel.SFX)
            return;

        if (sfxPool.Count == 0) return; // Avoid overflow

        AudioSource src = sfxPool.Dequeue();
        src.clip = entry.clip;
        src.volume = sfxVolume * entry.volume;
        src.pitch = pitch;

        src.Play();

        StartCoroutine(ReturnToPoolWhenDone(src));
    }

    public void PlayMusic(string key, float fadeDuration = 0.5f)
    {
        if (!_canPlaySounds) return; // Prevent playing sounds before user interaction (mobile autoplay policy)

        if (!library.TryGetClip(key, out var entry) || entry.channel != AudioChannel.Music)
            return;

        if (musicSource.isPlaying && musicSource.clip == entry.clip)
            return;

        StopCoroutine(nameof(CrossfadeMusic));
        StartCoroutine(CrossfadeMusic(entry.clip, entry.volume, entry.loop, fadeDuration));
    }

    public void StopMusic()
    {
        musicSource.Stop();
    }

    public void StopMusic(float fadeDuration = 1)
    {

    }

    public void SetMusicVolume(float volume)
    {
        musicVolume = Mathf.Clamp01(volume);
        musicSource.volume = musicVolume;
    }

    public void SetSFXVolume(float volume)
    {
        sfxVolume = Mathf.Clamp01(volume);
    }
    #endregion

    #region Private Helpers
    private IEnumerator ReturnToPoolWhenDone(AudioSource src)
    {
        yield return new WaitWhile(() => src.isPlaying);
        sfxPool.Enqueue(src);
    }

    private IEnumerator CrossfadeMusic(AudioClip newClip, float targetVolume, bool loop, float duration)
    {
        float startVolume = musicSource.volume;
        float t = 0f;

        // Fade out
        while (t < duration)
        {
            t += Time.deltaTime;
            musicSource.volume = Mathf.Lerp(startVolume, 0f, t / duration);
            yield return null;
        }

        musicSource.Stop();
        musicSource.clip = newClip;
        musicSource.loop = loop;
        musicSource.Play();

        // Fade in
        t = 0f;
        while (t < duration)
        {
            t += Time.deltaTime;
            musicSource.volume = Mathf.Lerp(0f, targetVolume, t / duration);
            yield return null;
        }

        musicSource.volume = targetVolume;
    }
    #endregion
}