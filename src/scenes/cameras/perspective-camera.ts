import { PerspectiveCamera as PerspectiveCamera3JS } from 'three/src/cameras/PerspectiveCamera';
import type { IPerspectiveCamera } from 'flexidy-engine-base/interfaces/scenes/cameras/perspective-camera';
import { Camera } from './camera';

export class PerspectiveCamera extends Camera<PerspectiveCamera3JS> implements IPerspectiveCamera {
  public get zoom(): number {
    return this.object3js.zoom;
  }

  public set zoom(value: number) {
    this.object3js.zoom = value;
  }

  public get fov(): number {
    return this.object3js.fov;
  }

  public setAspect(value: number) {
    this.object3js.aspect = value;
    this.object3js.updateProjectionMatrix();
  }

  public updateProjectionMatrix(): void {
    this.object3js.updateProjectionMatrix();
  }

  constructor(
    fov?: number,
    aspect?: number,
    near?: number,
    far?: number,
  ) {
    super(new PerspectiveCamera3JS(fov, aspect, near, far));
  }

  public dispose(): void {
    throw new Error('Needs to be implemented');
  }
}
