import Phaser from 'phaser';
import { DEPTH, LAYOUT } from '../constants';
import { DesignImage, DesignRegistry } from '../utils/designNode';

/**
 * The sand container (storyboard art `sand-container`): the white frame around the picture with the
 * funnel below it, drawn over the sand (its inner shadow falls on the picture's top edge). The grain
 * grid's funnel walls follow its inner edge (LAYOUT.frame).
 */
export class Frame {
  constructor(scene: Phaser.Scene, registry: DesignRegistry) {
    const c = LAYOUT.container;
    new DesignImage(registry, scene, 'sand-container', c.x + c.w / 2, c.y + c.h / 2, c.w, c.h).setDepth(DEPTH.FRAME);
  }
}
