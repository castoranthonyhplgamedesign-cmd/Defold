import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Scene } from '@babylonjs/core/scene';

export type HitEffectsOptions = {
  burstSize: number;
  burstCount: number;
  burstDuration: number;
  burstColors: Record<string, string>;
};

type Fragment = {
  mesh: Mesh;
  velocity: Vector3;
  baseScale: number;
  life: number;
  duration: number;
};

export class HitEffects {
  private readonly fragmentTemplate: Mesh;
  private readonly fragmentMaterials = new Map<string, StandardMaterial>();
  private readonly fragments: Fragment[] = [];
  private readonly whiteMaterial: StandardMaterial;

  constructor(scene: Scene, private readonly options: HitEffectsOptions) {
    this.whiteMaterial = new StandardMaterial('White block hit glints', scene);
    this.whiteMaterial.diffuseColor = Color3.White();
    this.whiteMaterial.emissiveColor = new Color3(0.85, 0.85, 0.85);
    this.whiteMaterial.disableLighting = true;
    this.whiteMaterial.specularColor = Color3.Black();

    this.fragmentTemplate = MeshBuilder.CreateSphere('Block burst particle template',
      { diameter: options.burstSize, segments: 8 }, scene);
    this.fragmentTemplate.isPickable = false;
    this.fragmentTemplate.setEnabled(false);
    for (const [color, hex] of Object.entries(options.burstColors)) {
      const material = new StandardMaterial(`${color} block fragments`, scene);
      material.diffuseColor = Color3.FromHexString(hex);
      material.emissiveColor = material.diffuseColor.scale(0.35);
      material.specularColor = Color3.Black();
      this.fragmentMaterials.set(color, material);
    }
  }

  burst(position: Vector3, color: string) {
    const colored = this.fragmentMaterials.get(color) ?? this.whiteMaterial;
    for (let i = 0; i < this.options.burstCount; i++) {
      let fragment: Fragment | undefined;
      for (let j = 0; j < this.fragments.length; j++) {
        if (this.fragments[j].life <= 0) { fragment = this.fragments[j]; break; }
      }
      if (!fragment) {
        const mesh = this.fragmentTemplate.clone('Block hit sphere', null, false)!;
        mesh.parent = null;
        mesh.isPickable = false;
        fragment = { mesh, velocity: Vector3.Zero(), baseScale: 1, life: 0, duration: 0 };
        this.fragments.push(fragment);
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 2.4;
      fragment.mesh.position.copyFrom(position);
      fragment.mesh.material = i % 4 === 0 ? this.whiteMaterial : colored;
      fragment.baseScale = 0.7 + Math.random() * 0.5;
      fragment.mesh.scaling.setAll(fragment.baseScale);
      fragment.velocity.set(Math.cos(angle) * speed, 1.7 + Math.random() * 2.4, Math.sin(angle) * speed);
      fragment.duration = this.options.burstDuration * (0.7 + Math.random() * 0.6);
      fragment.life = fragment.duration;
      fragment.mesh.setEnabled(true);
    }
  }

  update(deltaSeconds: number) {
    const dt = Math.min(deltaSeconds, 0.05);
    for (let i = 0; i < this.fragments.length; i++) {
      const fragment = this.fragments[i];
      if (fragment.life <= 0) continue;
      fragment.life = Math.max(0, fragment.life - dt);
      if (fragment.life === 0) {
        fragment.mesh.setEnabled(false);
        continue;
      }
      fragment.velocity.y -= 8 * dt;
      fragment.mesh.position.addInPlaceFromFloats(
        fragment.velocity.x * dt, fragment.velocity.y * dt, fragment.velocity.z * dt,
      );
      const shrink = Math.max(0.15, fragment.life / fragment.duration);
      fragment.mesh.scaling.setAll(fragment.baseScale * shrink);
    }
  }
}
