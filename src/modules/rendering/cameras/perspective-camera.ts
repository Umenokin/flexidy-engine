import { PerspectiveCamera as Camera3JS } from 'three/src/cameras/PerspectiveCamera';
import { IPerspectiveCamera } from 'flexidy-engine';
import { Camera } from './camera';

export class PerspectiveCamera<TCamera extends Camera3JS = Camera3JS> extends Camera<TCamera> implements IPerspectiveCamera {
  public setAspect(value: number) {
    this.object3js.aspect = value;
    this.object3js.updateProjectionMatrix();
  }

  public updateProjectionMatrix(): void {
    this.object3js.updateProjectionMatrix();
  }
}
