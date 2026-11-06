import select from '../assets/audio/select.wav';
import wrong from '../assets/audio/wrong.wav';
import shoot from '../assets/audio/shoot.wav';
import slidey from '../assets/audio/slidey.wav';
import bgm from '../assets/audio/bgm.mp3';
import win from '../assets/audio/sfx_win.mp3';
import fail from '../assets/audio/sfx-fail.mp3';
import warning from '../assets/audio/warning-pulse.mp3';
// Relative source gains 1:1:3:1.5, normalized together into HTML media's 0–1 range.
export const sounds = {
  select:{src:select,count:4,gain:1/3},wrong:{src:wrong,count:4,gain:1/3},
  shoot:{src:shoot,count:16,gain:1},slidey:{src:slidey,count:8,gain:.5},
  // Asset is attenuated 24 dB; this adds 6 dB of headroom below the existing SFX peaks.
  bgm:{src:bgm,count:1,gain:.5,loop:true},
  win:{src:win,count:1,gain:.15},
  fail:{src:fail,count:1,gain:.15},
  warning:{src:warning,count:2,gain:.22},
};
