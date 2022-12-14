import { Matrix4, Vector3 } from 'flexidy-engine-base';
import type { ICamera } from 'flexidy-engine-base/interfaces/scenes/cameras/camera';
import { Vector3 as Vector3JS } from 'three';
import { Camera as Camera3JS } from 'three/src/cameras/Camera';
import { SceneComponent } from '../scene-component';

const _vector3JS = new Vector3JS();

export abstract class Camera<TCam extends Camera3JS = Camera3JS> extends SceneComponent<TCam> implements ICamera {
  public abstract get zoom(): number;

  public abstract set zoom(value: number);

  public abstract updateProjectionMatrix(): void;

  public getWorldMatrix(out: Matrix4): Matrix4 {
    this.object3js.updateMatrixWorld();
    return out.fromArray(this.object3js.matrixWorld.elements);
  }

  constructor(camera3js: TCam) {
    super(camera3js);
    this.object3js.rotateY(Math.PI);
  }

  public projectPoint(out: Vector3): Vector3 {
    const v = _vector3JS.project(this.object3js);
    return out.set(v.x, v.y, v.z);
  }

  public unprojectPoint(out: Vector3): Vector3 {
    const v = _vector3JS.unproject(this.object3js);
    return out.set(v.x, v.y, v.z);
  }

  abstract dispose(): void;
}
