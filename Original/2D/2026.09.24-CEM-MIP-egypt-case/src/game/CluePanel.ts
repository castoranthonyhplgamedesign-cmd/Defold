import Phaser from 'phaser';
import { DEPTH } from '../constants';
import type { CharacterName, GameConfig } from '../types';
import { sd, sx, sy } from '../utils/responsive';

const TEXT_RESOLUTION = 2;
const snap = (value: number): number => Math.round(value);

interface ClueRow {
  character: CharacterName;
  label: Phaser.GameObjects.Text;
  strike: Phaser.GameObjects.Rectangle;
  solved: boolean;
}

export class CluePanel {
  private readonly title: Phaser.GameObjects.Text;
  private readonly rows: ClueRow[] = [];

  constructor(private readonly scene: Phaser.Scene, private readonly config: GameConfig) {
    this.title = scene.add.text(0, 0, config.CLUE_TITLE, { fontFamily: 'Grenze', fontStyle: 'bold', color: config.COLORS.title, align: 'center' })
      .setOrigin(0.5)
      .setResolution(TEXT_RESOLUTION)
      .setDepth(DEPTH.CLUES);
    for (const clue of config.CLUES) {
      const label = scene.add.text(0, 0, clue.text, { fontFamily: 'Grenze', fontStyle: '600', color: config.COLORS.clue, align: 'center' })
        .setOrigin(0.5)
        .setResolution(TEXT_RESOLUTION)
        .setDepth(DEPTH.CLUES);
      const strike = scene.add.rectangle(0, 0, 1, 1, Phaser.Display.Color.HexStringToColor(config.COLORS.strike).color).setOrigin(0, 0.5).setDepth(DEPTH.CLUES + 1).setScale(0, 1);
      this.rows.push({ character: clue.character, label, strike, solved: false });
    }
    this.relayout();
  }

  solve(character: CharacterName): void {
    const row = this.rows.find((item) => item.character === character);
    if (!row || row.solved) return;
    row.solved = true;
    row.strike.setScale(0, 1);
    this.scene.tweens.add({ targets: row.strike, scaleX: 1, duration: this.config.TIMING.snapMs, ease: 'Cubic.Out' });
  }

  relayout(): void {
    const rect = this.config.LAYOUT.clues;
    this.title
      .setPosition(snap(sx(rect.x + rect.width / 2)), snap(sy(this.config.CLUE_LAYOUT.titleY)))
      .setFontSize(Math.max(1, snap(sd(this.config.CLUE_LAYOUT.titleFontSize))));
    for (let i = 0; i < this.rows.length; i += 1) {
      const row = this.rows[i];
      const y = this.config.CLUE_LAYOUT.clueYPositions[i];
      row.label
        .setPosition(snap(sx(rect.x + rect.width / 2)), snap(sy(y)))
        .setFontSize(Math.max(1, snap(sd(this.config.CLUE_LAYOUT.clueFontSize))));
      const bounds = row.label.getBounds();
      row.strike
        .setPosition(snap(bounds.left), snap(row.label.y))
        .setSize(snap(bounds.width), Math.max(snap(sd(4)), 1));
    }
  }

  getTutorialHighlightBounds(): Phaser.Geom.Rectangle {
    const title = this.title.getBounds();
    const first = this.rows[0].label.getBounds();
    const left = Math.min(title.left, first.left);
    const top = Math.min(title.top, first.top);
    const right = Math.max(title.right, first.right);
    const bottom = Math.max(title.bottom, first.bottom);
    return new Phaser.Geom.Rectangle(left, top, right - left, bottom - top);
  }
}
