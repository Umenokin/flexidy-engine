import { Object3D } from 'three/src/core/Object3D';
import type { Vector3 as ThreeVector3 } from 'three/src/math/Vector3';
import { IEntity, DEG2RAD, Vector3, Immutable } from 'flexidy-engine';

export class Entity<TObject extends Object3D = Object3D> implements IEntity {
  public readonly object3js: TObject;

  constructor(object3d: TObject) {
    this.object3js = object3d;
  }

  public set lookAt(target: Immutable<Vector3>) {
    this.object3js.lookAt(target as unknown as ThreeVector3);
  }

  public setLookAt(x: number, y: number, z: number): this {
    this.object3js.lookAt(x, y, z);
    return this;
  }

  public rotateX(angle: number): this {
    this.object3js.rotateX(angle * DEG2RAD);
    return this;
  }

  public rotateY(angle: number): this {
    this.object3js.rotateY(angle * DEG2RAD);
    return this;
  }

  public rotateZ(angle: number): this {
    this.object3js.rotateZ(angle * DEG2RAD);
    return this;
  }

  public addRotation(angleX: number, angleY: number, angleZ: number): this {
    const rot = this.object3js.rotation;
    this.object3js.rotation.set(
      rot.x + (angleX * DEG2RAD),
      rot.y + (angleY * DEG2RAD),
      rot.z + (angleZ * DEG2RAD),
    );
    return this;
  }

  public setPosition(x: number, y: number, z: number): this {
    this.object3js.position.set(x, y, z);
    return this;
  }
}
