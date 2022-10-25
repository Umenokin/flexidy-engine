import { PerspectiveCamera as Camera3JS } from 'three/src/cameras/PerspectiveCamera';
import { IPerspectiveCamera } from 'flexidy-engine/modules/rendering/cameras/perspective-camera';
import { PERSPECTIVE_CAMERA_COMPONENT_TYPE } from 'flexidy-engine/constants';
import { Camera } from './camera';

export class PerspectiveCamera<TCamera extends Camera3JS = Camera3JS> extends Camera<TCamera> implements IPerspectiveCamera {
  public type = PERSPECTIVE_CAMERA_COMPONENT_TYPE;

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
}
