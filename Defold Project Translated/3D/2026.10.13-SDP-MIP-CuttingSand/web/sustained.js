var SandAudio = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var stdin_exports = {};
  __export(stdin_exports, {
    SustainedAudio: () => SustainedAudio
  });
  class SustainedAudio {
    constructor(scene, slot, tuning, onStart) {
      this.slot = slot;
      this.tuning = tuning;
      this.onStart = onStart;
      this.baseVolume = Number.isFinite(slot.volume) ? Math.max(0, Math.min(1, slot.volume)) : 1;
      this.voices = [];
      for (let i = 0; i < 2; i++) {
        const sound = scene.sound.add(slot.id, { volume: 0, loop: false });
        sound.setVolume(0);
        this.voices.push({ sound, weight: 0, config: { volume: 0, loop: false, seek: 0, rate: 1 } });
      }
      this.loopEnd = this.voices[0].sound.duration || 0;
      this.findContentBounds(scene.cache.audio.get(slot.id));
    }
    voices;
    baseVolume;
    loopStart = 0;
    loopEnd = 0;
    active = -1;
    incoming = -1;
    crossElapsed = 0;
    crossDuration = 0;
    gain = 0;
    target = 0;
    fadeFrom = 0;
    fadeElapsed = 0;
    fadeDuration = 0;
    previousRequested = false;
    started = false;
    complete = false;
    replayPending = false;
    destroyed = false;
    /** Analyse once: repeating at a silent recording head would defeat the overlap. */
    findContentBounds(cached) {
      const buffer = cached;
      if (!buffer || typeof buffer.getChannelData !== "function" || !buffer.length || !buffer.sampleRate) return;
      const windowSize = Math.max(1, Math.round(buffer.sampleRate * 0.02));
      const windows = new Float32Array(Math.ceil(buffer.length / windowSize));
      const channels = buffer.numberOfChannels || 1;
      for (let channel = 0; channel < channels; channel++) {
        const data = buffer.getChannelData(channel);
        for (let window = 0; window < windows.length; window++) {
          const start = window * windowSize;
          const end = Math.min(start + windowSize, data.length);
          let energy = 0;
          for (let sample = start; sample < end; sample++) energy += data[sample] * data[sample];
          windows[window] += energy / Math.max(1, end - start) / channels;
        }
      }
      let peak = 0;
      for (let i = 0; i < windows.length; i++) peak = Math.max(peak, windows[i]);
      if (!(peak > 0)) return;
      const threshold = peak * 0.025 * 0.025;
      let first = 0;
      let last = windows.length - 1;
      while (first < last && windows[first] < threshold) first++;
      while (last > first && windows[last] < threshold) last--;
      this.loopStart = Math.max(0, (first - 1) * windowSize / buffer.sampleRate);
      this.loopEnd = Math.min(buffer.length / buffer.sampleRate, (last + 2) * windowSize / buffer.sampleRate);
    }
    start(index, seek) {
      const voice = this.voices[index];
      if (voice.sound.manager.locked) return false;
      voice.config.seek = seek;
      voice.config.volume = 0;
      if (!voice.sound.play(voice.config)) return false;
      voice.weight = 1;
      this.started = true;
      this.onStart();
      return true;
    }
    fadeTo(target, duration) {
      if (this.target === target) return;
      this.target = target;
      this.fadeFrom = this.gain;
      this.fadeElapsed = 0;
      this.fadeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
      if (this.fadeDuration === 0) this.gain = target;
    }
    clearVoices() {
      for (let i = 0; i < this.voices.length; i++) {
        this.voices[i].sound.stop();
        this.voices[i].weight = 0;
      }
      this.active = this.incoming = -1;
      this.crossElapsed = this.crossDuration = 0;
    }
    /** The caller freezes updates while paused and gates all starts with `allowed`. */
    update(deltaMs, requested, allowed, releaseMs = this.tuning.flowFadeMs) {
      if (this.destroyed || !allowed) return;
      for (let i = 0; i < this.voices.length; i++) if (this.voices[i].sound.isPaused) return;
      const delta = Number.isFinite(deltaMs) ? Math.max(0, deltaMs) : 0;
      if (requested && !this.previousRequested) {
        if (this.complete && this.active >= 0) this.replayPending = true;
        else this.complete = false;
        if (this.active < 0) this.started = false;
      }
      if (!requested) this.replayPending = false;
      this.previousRequested = requested;
      if (this.active >= 0 && !this.voices[this.active].sound.isPlaying) {
        if (this.incoming >= 0 && this.voices[this.incoming].sound.isPlaying) {
          this.voices[this.active].weight = 0;
          this.active = this.incoming;
          this.voices[this.active].weight = 1;
          this.incoming = -1;
        } else {
          this.active = this.incoming = -1;
          if (!this.slot.loop && this.started) this.complete = true;
        }
      }
      if (this.replayPending && this.active < 0) {
        this.complete = this.started = this.replayPending = false;
      }
      let wanted = requested && !this.complete;
      if (wanted && this.active < 0) {
        this.gain = this.target = 0;
        if (this.start(0, this.started ? this.loopStart : 0)) this.active = 0;
      }
      let justCrossed = false;
      if (this.active >= 0) {
        const voice = this.voices[this.active];
        const duration = voice.sound.duration;
        const end = this.loopEnd > 0 ? Math.min(this.loopEnd, duration) : duration;
        const rate = voice.sound.totalRate > 0 ? voice.sound.totalRate : 1;
        const remainingMs = (end - voice.sound.seek) * 1e3 / rate;
        const clipMs = Math.max(0, end - this.loopStart) * 1e3 / rate;
        const overlapMs = Math.max(0, Math.min(this.tuning.loopCrossfadeMs, clipMs * 0.4));
        if (this.replayPending && this.incoming < 0 && remainingMs > 0 && overlapMs > 0) {
          const next = 1 - this.active;
          if (this.start(next, 0)) {
            this.incoming = next;
            this.voices[next].weight = 0;
            this.crossElapsed = 0;
            this.crossDuration = Math.min(remainingMs, overlapMs);
            this.complete = this.replayPending = false;
            wanted = justCrossed = true;
          }
        }
        if ((wanted || this.gain > 0) && this.slot.loop && this.incoming < 0 && remainingMs <= overlapMs) {
          if (remainingMs <= 0) {
            this.clearVoices();
            this.gain = this.target = 0;
            if (this.start(0, this.loopStart)) this.active = 0;
          } else {
            const next = 1 - this.active;
            if (this.start(next, this.loopStart)) {
              this.incoming = next;
              this.voices[next].weight = 0;
              this.crossElapsed = 0;
              this.crossDuration = remainingMs;
              justCrossed = true;
            }
          }
        } else if (wanted && !this.slot.loop && this.incoming < 0 && remainingMs <= Math.max(0, Math.min(this.tuning.flowFadeMs, clipMs * 0.4))) {
          this.complete = true;
          wanted = false;
          this.fadeTo(0, Math.max(0, remainingMs));
        }
      }
      this.fadeTo(wanted ? 1 : 0, wanted ? this.tuning.flowFadeInMs : releaseMs);
      if (this.fadeElapsed < this.fadeDuration) {
        this.fadeElapsed = Math.min(this.fadeDuration, this.fadeElapsed + delta);
        this.gain = this.fadeFrom + (this.target - this.fadeFrom) * this.fadeElapsed / this.fadeDuration;
      }
      if (this.incoming >= 0) {
        if (!justCrossed) this.crossElapsed += delta;
        const progress = Math.min(1, this.crossElapsed / this.crossDuration);
        this.voices[this.active].weight = 1 - progress;
        this.voices[this.incoming].weight = progress;
        if (progress === 1) {
          this.voices[this.active].sound.stop();
          this.active = this.incoming;
          this.incoming = -1;
        }
      }
      for (let i = 0; i < this.voices.length; i++) {
        const voice = this.voices[i];
        if (voice.sound.isPlaying) voice.sound.setVolume(this.baseVolume * this.gain * voice.weight);
      }
      if (this.target === 0 && this.gain === 0) this.clearVoices();
    }
    stop() {
      if (this.destroyed) return;
      this.clearVoices();
      this.gain = this.target = this.fadeFrom = this.fadeElapsed = this.fadeDuration = 0;
      this.previousRequested = this.started = this.complete = this.replayPending = false;
    }
    destroy() {
      if (this.destroyed) return;
      this.stop();
      for (let i = 0; i < this.voices.length; i++) this.voices[i].sound.destroy();
      this.destroyed = true;
    }
    snapshot() {
      let playing = 0;
      let paused = 0;
      let volume = 0;
      const voices = [];
      for (let i = 0; i < this.voices.length; i++) {
        const voice = this.voices[i];
        const sound = voice.sound;
        if (sound.isPlaying) playing++;
        if (sound.isPaused) paused++;
        if (sound.isPlaying || sound.isPaused) volume += sound.volume;
        voices.push({
          playing: sound.isPlaying,
          paused: sound.isPaused,
          volume: sound.volume,
          seek: sound.seek,
          duration: sound.duration,
          weight: voice.weight
        });
      }
      return {
        playing,
        paused,
        capacity: 2,
        volume,
        baseVolume: this.baseVolume,
        targetVolume: this.baseVolume * this.target,
        logicalGain: this.gain,
        crossfading: this.incoming >= 0,
        loopStart: this.loopStart,
        loopEnd: this.loopEnd,
        voices
      };
    }
  }
  return __toCommonJS(stdin_exports);
})();
