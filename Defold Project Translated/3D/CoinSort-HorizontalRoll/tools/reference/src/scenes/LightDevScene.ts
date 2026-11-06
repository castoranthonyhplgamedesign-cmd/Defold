import Phaser from 'phaser';
import type { Coin3DController, DirectionalLight3DState } from '../game/Coin3DController';

type LightDevSceneData = {
  coin3D?: Coin3DController;
};

type NumberInputKey =
  | 'positionX'
  | 'positionY'
  | 'positionZ'
  | 'yawDegrees'
  | 'pitchDegrees'
  | 'distance'
  | 'intensity'
  | 'ambientIntensity';

type AimAngles3D = {
  yawDegrees: number;
  pitchDegrees: number;
  distance: number;
};

type LightExportJson = {
  ambientLightIntensity3D: number;
  directionalLightIntensity3D: number;
  directionalLightPosition3D: { x: number; y: number; z: number };
  directionalLightTargetOffset3D: { x: number; y: number; z: number };
  directionalLightShadowEnabled3D: boolean;
};

const LIGHT_DEV_SCENE_KEY = 'LightDevScene';
const MIN_LIGHT_DISTANCE_3D = 1;

export class LightDevScene extends Phaser.Scene {
  private coin3D: Coin3DController | null = null;
  private panel: HTMLDivElement | null = null;
  private output: HTMLTextAreaElement | null = null;
  private status: HTMLDivElement | null = null;
  private shadowInput: HTMLInputElement | null = null;
  private readonly inputs = new Map<NumberInputKey, HTMLInputElement>();

  constructor() {
    super(LIGHT_DEV_SCENE_KEY);
  }

  init(data: LightDevSceneData): void {
    this.coin3D = data.coin3D ?? null;
  }

  create(): void {
    if (!this.coin3D) {
      this.scene.stop();
      return;
    }

    this.coin3D.setLightDebugVisible3D(true);
    this.createPanel();
    const state = this.coin3D.getDirectionalLightState3D();
    this.populateInputsFromState(state);
    this.updateOutput(state);
    this.coin3D.relayout();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyPanel());
  }

  private createPanel(): void {
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '12px';
    panel.style.right = '12px';
    panel.style.width = 'min(380px, calc(100vw - 24px))';
    panel.style.maxHeight = 'calc(100vh - 24px)';
    panel.style.overflow = 'auto';
    panel.style.boxSizing = 'border-box';
    panel.style.padding = '14px';
    panel.style.border = '1px solid rgba(255,255,255,0.22)';
    panel.style.borderRadius = '8px';
    panel.style.background = 'rgba(7, 15, 28, 0.92)';
    panel.style.color = '#eef7ff';
    panel.style.font = '12px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    panel.style.zIndex = '10000';
    panel.style.pointerEvents = 'auto';
    panel.style.boxShadow = '0 12px 40px rgba(0,0,0,0.45)';
    panel.addEventListener('pointerdown', event => event.stopPropagation());
    panel.addEventListener('keydown', event => event.stopPropagation());
    panel.addEventListener('wheel', event => event.stopPropagation(), { passive: true });

    const title = document.createElement('div');
    title.textContent = 'Directional Light Dev';
    title.style.fontWeight = '700';
    title.style.fontSize = '14px';
    title.style.marginBottom = '10px';
    panel.appendChild(title);

    this.addSectionTitle(panel, 'Position');
    this.addNumberInput(panel, 'X', 'positionX', 10);
    this.addNumberInput(panel, 'Y', 'positionY', 10);
    this.addNumberInput(panel, 'Z', 'positionZ', 100);

    this.addSectionTitle(panel, 'Aim');
    this.addNumberInput(panel, 'Yaw', 'yawDegrees', 1);
    this.addNumberInput(panel, 'Pitch', 'pitchDegrees', 1);
    this.addNumberInput(panel, 'Distance', 'distance', 100);

    this.addSectionTitle(panel, 'Light');
    this.addNumberInput(panel, 'Intensity', 'intensity', 0.1);
    this.addNumberInput(panel, 'Ambient', 'ambientIntensity', 0.1);
    this.addShadowInput(panel);

    this.output = document.createElement('textarea');
    this.output.readOnly = true;
    this.output.spellcheck = false;
    this.output.style.width = '100%';
    this.output.style.height = '178px';
    this.output.style.boxSizing = 'border-box';
    this.output.style.marginTop = '12px';
    this.output.style.padding = '10px';
    this.output.style.border = '1px solid rgba(255,255,255,0.18)';
    this.output.style.borderRadius = '6px';
    this.output.style.background = 'rgba(0,0,0,0.36)';
    this.output.style.color = '#ffffff';
    this.output.style.font = '11px/1.35 Consolas, "Courier New", monospace';
    panel.appendChild(this.output);

    const buttons = document.createElement('div');
    buttons.style.display = 'grid';
    buttons.style.gridTemplateColumns = '1fr 1fr 1fr';
    buttons.style.gap = '8px';
    buttons.style.marginTop = '10px';
    buttons.appendChild(this.createButton('Copy', () => void this.copyJson()));
    buttons.appendChild(this.createButton('Download', () => this.downloadJson()));
    buttons.appendChild(this.createButton('Close', () => this.scene.stop()));
    panel.appendChild(buttons);

    this.status = document.createElement('div');
    this.status.style.minHeight = '16px';
    this.status.style.marginTop = '8px';
    this.status.style.color = '#9ee7ff';
    panel.appendChild(this.status);

    document.body.appendChild(panel);
    this.panel = panel;
  }

  private addSectionTitle(panel: HTMLDivElement, label: string): void {
    const title = document.createElement('div');
    title.textContent = label;
    title.style.margin = '12px 0 6px';
    title.style.color = '#9ee7ff';
    title.style.fontWeight = '700';
    panel.appendChild(title);
  }

  private addNumberInput(panel: HTMLDivElement, label: string, key: NumberInputKey, step: number): void {
    const row = this.createRow(label);
    const input = document.createElement('input');
    input.type = 'number';
    input.step = String(step);
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.style.padding = '6px 8px';
    input.style.border = '1px solid rgba(255,255,255,0.2)';
    input.style.borderRadius = '6px';
    input.style.background = 'rgba(255,255,255,0.08)';
    input.style.color = '#ffffff';
    input.style.font = '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    input.addEventListener('input', () => this.applyControls());
    row.appendChild(input);
    panel.appendChild(row);
    this.inputs.set(key, input);
  }

  private addShadowInput(panel: HTMLDivElement): void {
    const row = this.createRow('Shadows');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.width = '18px';
    input.style.height = '18px';
    input.addEventListener('change', () => this.applyControls());
    row.appendChild(input);
    panel.appendChild(row);
    this.shadowInput = input;
  }

  private createRow(labelText: string): HTMLDivElement {
    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '88px 1fr';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.marginTop = '6px';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.color = '#d8eaff';
    row.appendChild(label);
    return row;
  }

  private createButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.padding = '8px';
    button.style.border = '1px solid rgba(255,255,255,0.22)';
    button.style.borderRadius = '6px';
    button.style.background = 'rgba(158,231,255,0.14)';
    button.style.color = '#ffffff';
    button.style.cursor = 'pointer';
    button.style.font = '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    button.addEventListener('click', onClick);
    return button;
  }

  private populateInputsFromState(state: DirectionalLight3DState): void {
    const angles = this.getAnglesFromTargetOffset(state.targetOffset);
    this.setInputValue('positionX', state.position.x);
    this.setInputValue('positionY', state.position.y);
    this.setInputValue('positionZ', state.position.z);
    this.setInputValue('yawDegrees', angles.yawDegrees);
    this.setInputValue('pitchDegrees', angles.pitchDegrees);
    this.setInputValue('distance', angles.distance);
    this.setInputValue('intensity', state.intensity);
    this.setInputValue('ambientIntensity', state.ambientIntensity);

    if (this.shadowInput) {
      this.shadowInput.checked = state.shadowEnabled;
    }
  }

  private applyControls(): void {
    if (!this.coin3D) {
      return;
    }

    const current = this.coin3D.getDirectionalLightState3D();
    const currentAngles = this.getAnglesFromTargetOffset(current.targetOffset);
    const yawDegrees = this.readInputValue('yawDegrees', currentAngles.yawDegrees);
    const pitchDegrees = this.readInputValue('pitchDegrees', currentAngles.pitchDegrees);
    const distance = Math.max(MIN_LIGHT_DISTANCE_3D, this.readInputValue('distance', currentAngles.distance));
    const nextState: DirectionalLight3DState = {
      position: {
        x: this.readInputValue('positionX', current.position.x),
        y: this.readInputValue('positionY', current.position.y),
        z: this.readInputValue('positionZ', current.position.z),
      },
      targetOffset: this.getTargetOffsetFromAngles({ yawDegrees, pitchDegrees, distance }),
      intensity: Math.max(0, this.readInputValue('intensity', current.intensity)),
      ambientIntensity: Math.max(0, this.readInputValue('ambientIntensity', current.ambientIntensity)),
      shadowEnabled: this.shadowInput?.checked ?? current.shadowEnabled,
    };

    this.coin3D.setDirectionalLightState3D(nextState);
    this.coin3D.relayout();
    this.updateOutput(nextState);
  }

  private updateOutput(state: DirectionalLight3DState): void {
    if (!this.output) {
      return;
    }

    this.output.value = `${JSON.stringify(this.createExportJson(state), null, 2)}\n`;
  }

  private createExportJson(state: DirectionalLight3DState): LightExportJson {
    return {
      ambientLightIntensity3D: this.roundNumber(state.ambientIntensity),
      directionalLightIntensity3D: this.roundNumber(state.intensity),
      directionalLightPosition3D: this.roundVector(state.position),
      directionalLightTargetOffset3D: this.roundVector(state.targetOffset),
      directionalLightShadowEnabled3D: state.shadowEnabled,
    };
  }

  private getTargetOffsetFromAngles(angles: AimAngles3D): { x: number; y: number; z: number } {
    const yaw = Phaser.Math.DegToRad(angles.yawDegrees);
    const pitch = Phaser.Math.DegToRad(angles.pitchDegrees);
    const horizontalDistance = Math.cos(pitch) * angles.distance;

    return {
      x: Math.sin(yaw) * horizontalDistance,
      y: Math.sin(pitch) * angles.distance,
      z: -Math.cos(yaw) * horizontalDistance,
    };
  }

  private getAnglesFromTargetOffset(offset: { x: number; y: number; z: number }): AimAngles3D {
    const distance = Math.max(MIN_LIGHT_DISTANCE_3D, Math.hypot(offset.x, offset.y, offset.z));
    const horizontalDistance = Math.hypot(offset.x, offset.z);

    return {
      yawDegrees: Phaser.Math.RadToDeg(Math.atan2(offset.x, -offset.z)),
      pitchDegrees: Phaser.Math.RadToDeg(Math.atan2(offset.y, horizontalDistance)),
      distance,
    };
  }

  private async copyJson(): Promise<void> {
    const json = this.output?.value ?? '';

    try {
      await navigator.clipboard.writeText(json);
      this.setStatus('Copied.');
      return;
    } catch {
      this.output?.select();
      document.execCommand('copy');
      this.setStatus('Copied.');
    }
  }

  private downloadJson(): void {
    const blob = new Blob([this.output?.value ?? ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'coin-directional-light.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    this.setStatus('Downloaded.');
  }

  private setStatus(message: string): void {
    if (!this.status) {
      return;
    }

    this.status.textContent = message;
  }

  private readInputValue(key: NumberInputKey, fallback: number): number {
    const value = Number(this.inputs.get(key)?.value);
    return Number.isFinite(value) ? value : fallback;
  }

  private setInputValue(key: NumberInputKey, value: number): void {
    const input = this.inputs.get(key);

    if (input) {
      input.value = String(this.roundNumber(value));
    }
  }

  private roundVector(vector: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    return {
      x: this.roundNumber(vector.x),
      y: this.roundNumber(vector.y),
      z: this.roundNumber(vector.z),
    };
  }

  private roundNumber(value: number): number {
    const rounded = Math.round(value * 1000) / 1000;
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  private destroyPanel(): void {
    this.panel?.remove();
    this.panel = null;
    this.output = null;
    this.status = null;
    this.shadowInput = null;
    this.inputs.clear();
  }
}
