# Wide-U Babylon Playable

This is the Babylon.js playable-ad port workspace for the Unity Wide-U scene.

Read first:

- `AGENTS.md`
- `PORT_PLAN.md`

## Setup

PowerShell may block `npm.ps1` on this machine, so use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

## Build

```powershell
npm.cmd run build:all
npm.cmd run validate:dist
```

`npm.cmd run build` is useful for a quick local singlefile preview. `build:all` is the final playable export path: it creates per-network/per-iteration outputs under `dist/` and applies playable-ad constraints:

- Line-1 network comment.
- MRAID script injection for Applovin, Ironsource, and Unity.
- ExitAPI injection for Google.
- Mintegral `gameReady()` body hook.
- Vungle/TikTok runtime flags.
- `type="module"` and `crossorigin` stripping.
- `console.error` scrubbing from production bundles.
- ZIP packaging for configured networks.

Current default export includes 8 networks: Applovin, Google, Ironsource, Mintegral, Facebook, Unity, Vungle, and Moloco. TikTok is configured but disabled until it is needed.

Iteration filename templates:

- Full: `bbs_mip_grhpl_wideu_01_real_nougc_noseason_en_full_na_{network}`
- FourClicks: `bbs_mip_grhpl_wideu_01_real_nougc_noseason_en_4clk_na_{network}`
- ThirtySeconds: `bbs_mip_grhpl_wideu_01_real_nougc_noseason_en_30sec_na_{network}`

## Current Status

The Babylon/Vite scaffold is in place. The Unity scene manifest and converted GLB assets still need to be added after `Assets/Scenes/Wide-U.unity` is locked.
