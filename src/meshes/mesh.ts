import { Mesh as Mesh3JS } from 'three/src/objects/Mesh';
import type { IMesh } from 'flexidy-engine-base/interfaces/meshes/mesh';
import { BufferGeometry } from '../geometry/buffer-geometry';
import { Material } from '../materials/material';
import { SceneComponent } from '../scenes/scene-component';

export class Mesh extends SceneComponent<Mesh3JS> implements IMesh {
  constructor(geometry?: BufferGeometry, material?: Material) {
    super(new Mesh3JS(geometry?.geometry3js, material?.material3js));
  }

  public dispose(): void {
    throw new Error('Needs to be implemented');
  }
}
