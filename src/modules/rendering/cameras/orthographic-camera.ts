import { OrthographicCamera as Camera3JS } from 'three/src/cameras/OrthographicCamera';
import { IOrthographicCamera } from 'flexidy-engine/modules/rendering/cameras/orthographic-camera';
import { ORTHOGRAPHIC_CAMERA_COMPONENT_TYPE } from 'flexidy-engine/constants';
import { Camera } from './camera';

export class OrthographicCamera<TCamera extends Camera3JS = Camera3JS> extends Camera<TCamera> implements IOrthographicCamera {
  public readonly type = ORTHOGRAPHIC_CAMERA_COMPONENT_TYPE;

  public get zoom(): number {
    return this.object3js.zoom;
  }

  public set zoom(value: number) {
    this.object3js.zoom = value;
  }

  public get left(): number {
    return this.object3js.left;
  }

  public get right(): number {
    return this.object3js.right;
  }

  public get top(): number {
    return this.object3js.top;
  }

  public get bottom(): number {
    return this.object3js.bottom;
  }

  public updateProjectionMatrix(): void {
    this.object3js.updateProjectionMatrix();
  }
}
