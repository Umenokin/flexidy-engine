import { OrthographicCamera as OrthographicCamera3JS } from 'three/src/cameras/OrthographicCamera';
import type { IOrthographicCamera } from 'flexidy-engine-base/interfaces/scenes/cameras/orthographic-camera';
import { Camera } from './camera';

export class OrthographicCamera extends Camera<OrthographicCamera3JS> implements IOrthographicCamera {
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

  constructor(
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
    near?: number,
    far?: number,
  ) {
    super(new OrthographicCamera3JS(left, right, top, bottom, near, far));
  }

  public dispose(): void {
    throw new Error('Needs to be implemented');
  }
}
