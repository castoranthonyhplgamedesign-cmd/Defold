import Phaser from 'phaser'

declare const __PERF__: boolean

/** `PERF=1 npm run build` → dist-perf/: on-screen frame breakdown for on-device checks. Off (dead code) otherwise. */
export const PERF = __PERF__

/** Work done inside the current frame; modules add to it, the HUD reads + resets it at each Phaser step. */
export const perfFrame = { phys: 0, steps: 0, sfx: 0, sfxN: 0, redraw: 0, redrawN: 0 }

/**
 * Per second: fps and, for the worst frame, where its time went. cpu = Phaser step start → render end;
 * "other" = frame time outside that (GPU/compositor wait, GC, browser work, sync IPC in WKWebView).
 */
export function startPerfHud(game: Phaser.Game) {
  const el = document.createElement('div')
  // Below the safe area (notch / Dynamic Island) so no line hides behind the status bar.
  el.style.cssText = 'position:fixed;left:6px;top:calc(env(safe-area-inset-top) + 70px);z-index:20;pointer-events:none;font:bold 12px/1.4 monospace;color:#0f0;background:rgba(0,0,0,.75);padding:4px 6px;white-space:pre'
  el.textContent = 'perf: measuring…'
  document.body.appendChild(el)

  const f = perfFrame
  let stepStart = 0
  let renderStart = 0
  let cpu = 0
  let render = 0
  let frames = 0
  let slow = 0
  let windowStart = performance.now()
  const sec = { phys: 0, sfx: 0, sfxN: 0, redraw: 0, redrawN: 0 }
  let worst = { dt: 0, cpu: 0, render: 0, phys: 0, steps: 0, sfx: 0, sfxN: 0, redraw: 0, redrawN: 0 }

  game.events.on(Phaser.Core.Events.PRE_STEP, () => {
    const now = performance.now()
    if (stepStart) {
      const dt = now - stepStart
      frames++
      if (dt > 20) slow++
      if (dt > worst.dt) worst = { dt, cpu, render, ...f }
      sec.phys += f.phys
      sec.sfx += f.sfx
      sec.sfxN += f.sfxN
      sec.redraw += f.redraw
      sec.redrawN += f.redrawN
    }
    f.phys = f.steps = f.sfx = f.sfxN = f.redraw = f.redrawN = 0
    stepStart = now
    if (now - windowStart >= 1000) {
      const s = (now - windowStart) / 1000
      const w = worst
      el.textContent = [
        `fps ${(frames / s).toFixed(0)}  >20ms ${slow}`,
        `worst ${w.dt.toFixed(0)}ms = cpu ${w.cpu.toFixed(0)} + other ${Math.max(0, w.dt - w.cpu).toFixed(0)}`,
        ` render ${w.render.toFixed(1)}  phys ${w.phys.toFixed(1)}/${w.steps}st`,
        ` sfx ${w.sfx.toFixed(1)}/${w.sfxN}  redraw ${w.redraw.toFixed(1)}/${w.redrawN}`,
        `per s: phys ${sec.phys.toFixed(0)}ms  sfx ${sec.sfx.toFixed(0)}ms/${sec.sfxN}`,
        ` redraw ${sec.redrawN}/s  avg ${sec.redrawN ? (sec.redraw / sec.redrawN).toFixed(2) : '0'}ms`,
      ].join('\n')
      frames = slow = 0
      sec.phys = sec.sfx = sec.sfxN = sec.redraw = sec.redrawN = 0
      worst = { dt: 0, cpu: 0, render: 0, phys: 0, steps: 0, sfx: 0, sfxN: 0, redraw: 0, redrawN: 0 }
      windowStart = now
    }
  })
  game.events.on(Phaser.Core.Events.PRE_RENDER, () => (renderStart = performance.now()))
  game.events.on(Phaser.Core.Events.POST_RENDER, () => {
    const now = performance.now()
    render = now - renderStart
    cpu = now - stepStart
  })
}

/** Times Matter world steps (several per frame = the fixed-step runner catching up). */
export function perfPhysics(world: Phaser.Physics.Matter.World) {
  let t0 = 0
  world.on(Phaser.Physics.Matter.Events.BEFORE_UPDATE, () => (t0 = performance.now()))
  world.on(Phaser.Physics.Matter.Events.AFTER_UPDATE, () => {
    perfFrame.phys += performance.now() - t0
    perfFrame.steps++
  })
}
