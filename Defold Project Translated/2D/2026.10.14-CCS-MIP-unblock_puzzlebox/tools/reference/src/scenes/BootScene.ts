import Phaser from 'phaser'
import { trackEvent } from '../analytics'
import handPoint from '../../Assets/images/new/hand-point.webp'
import board from '../../Assets/images/new/container.webp'
import logo from '../../Assets/images/ui_logo.webp'
import ringAtlas from '../../Assets/images/ring_atlas.webp'
import restart from '../../Assets/images/new/restart-icon.webp'
import goalBoard from '../../Assets/images/new/goall-board.webp'
import nextBoard from '../../Assets/images/new/next-board.webp'
import gift from '../../Assets/images/new/ui_gift.webp'
import failLogo from '../../Assets/images/failBadge.webp'
import giftOpen from '../../Assets/images/new/gift_open_sheet.webp'
import bgm from '../../Assets/audio/bgm_loop.mp3'
import merge from '../../Assets/audio/sfx_merge.mp3'
import pop from '../../Assets/audio/sfx_pop.mp3'
import warn from '../../Assets/audio/sfx_warn.mp3'

/** `sheet` = spritesheet with `frame` [w, h] px. */
type Manifest = { key: string; url: string; type: 'image' | 'audio' | 'sheet'; frame?: [number, number] }[]

/** First-frame assets, target < 200 KB. */
export const CRITICAL: Manifest = [
  { key: 'hand_point', url: handPoint, type: 'image' },
  { key: 'board', url: board, type: 'image' },
  { key: 'ring_atlas', url: ringAtlas, type: 'image' },
  { key: 'restart', url: restart, type: 'image' },
  { key: 'goal_board', url: goalBoard, type: 'image' },
  { key: 'next_board', url: nextBoard, type: 'image' },
  { key: 'gift', url: gift, type: 'image' },
]

/** Audio, overlays, endcard — loaded by GameScene during the intro. */
export const DEFERRED: Manifest = [
  { key: 'logo', url: logo, type: 'image' },
  { key: 'fail_logo', url: failLogo, type: 'image' },
  { key: 'gift_open', url: giftOpen, type: 'sheet', frame: [512, 768] }, // win beat (see GIFT_OPEN_SPRITESHEET.md)
  { key: 'bgm', url: bgm, type: 'audio' },
  { key: 'merge', url: merge, type: 'audio' },
  { key: 'pop', url: pop, type: 'audio' },
  { key: 'warn', url: warn, type: 'audio' },
]

export function queue(load: Phaser.Loader.LoaderPlugin, manifest: Manifest) {
  for (let i = 0; i < manifest.length; i++) {
    const a = manifest[i]
    if (a.type === 'image') load.image(a.key, a.url)
    else if (a.type === 'sheet') load.spritesheet(a.key, a.url, { frameWidth: a.frame![0], frameHeight: a.frame![1] })
    else load.audio(a.key, a.url)
  }
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    queue(this.load, CRITICAL)
  }

  create() {
    trackEvent('LOADED') // first-frame assets ready; DISPLAYED follows once the intro ends and input is live
    this.scene.start('Game')
  }
}
