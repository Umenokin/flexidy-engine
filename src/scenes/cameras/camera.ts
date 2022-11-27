import { Camera as Camera3JS } from 'three/src/cameras/Camera';
import type { ICamera } from 'flexidy-engine-base/scenes/cameras/camera';
import { SceneComponent } from '../scene-component';

export abstract class Camera<TCam extends Camera3JS = Camera3JS> extends SceneComponent<TCam> implements ICamera {
  public abstract get zoom(): number;

  public abstract set zoom(value: number);

  public abstract updateProjectionMatrix(): void;

  constructor(camera3js: TCam) {
    super(camera3js);
    this.object3js.rotateY(Math.PI);
  }
}
