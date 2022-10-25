import { Camera as Camera3JS } from 'three/src/cameras/Camera';
import { ICamera } from 'flexidy-engine/modules/rendering/cameras/camera';
import { SceneComponent } from '../../../scene-component';

export abstract class Camera<TCam extends Camera3JS = Camera3JS> extends SceneComponent<TCam> implements ICamera {
  public abstract readonly type: number;

  public abstract get zoom(): number;

  public abstract set zoom(value: number);

  public abstract updateProjectionMatrix(): void;
}
