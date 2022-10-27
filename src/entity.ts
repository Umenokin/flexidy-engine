/* eslint-disable no-param-reassign */
import { Object3D } from 'three/src/core/Object3D';
import { IEntity, DEG2RAD, CVector3, Vector3, Quaternion, Immutable, IScene, ImmutableObject } from 'flexidy-engine';
import { IComponent } from 'flexidy-engine/component';
import { Matrix4 } from 'flexidy-engine/math/matrix4';

export class Entity<TObject extends Object3D = Object3D> implements IEntity {
  private _parent: IEntity|null = null;

  private _children: IEntity[] = [];

  private _components: IComponent[] = [];

  private _tempPosition = new Vector3();

  private _tempUp = new Vector3();

  private _tempQuaternion = new Quaternion();

  private _tempMatrix = new Matrix4();

  public get parent(): IEntity|null {
    return this._parent;
  }

  private setParent(parent: IEntity|null) {
    this._parent = parent;
  }

  public get parentScene(): IScene|null {
    return this._parent?.parentScene || null;
  }

  public get children(): IEntity[] {
    return this._children;
  }

  public get components(): IComponent[] {
    return this._components;
  }

  public get position(): CVector3 {
    return this._tempPosition.copy(this.object3js.position as unknown as Vector3);
  }

  public get quaternion(): Immutable<Quaternion> {
    return this._tempQuaternion.copy(this.object3js.quaternion as unknown as Quaternion);
  }

  public get up(): ImmutableObject<Vector3> {
    return this._tempUp.copy(this.object3js.up as unknown as Vector3);
  }

  public get matrix(): ImmutableObject<Matrix4> {
    return this._tempMatrix.fromArray(this.object3js.matrix.elements);
  }

  constructor(
    public readonly object3js: TObject,
  ) {}

  public setLookAt(vec: CVector3): this;
  public setLookAt(x: number, y: number, z: number): this;
  public setLookAt(x: CVector3|number, y?: number, z?: number): this {
    if (z === undefined) {
      const v = x as CVector3;
      this.object3js.lookAt(v.x, v.y, v.z);
    } else {
      this.object3js.lookAt(x as number, y!, z);
    }
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

  public setPosition(vec: CVector3): this;
  public setPosition(x: number, y: number, z: number): this;
  public setPosition(x: CVector3|number, y?: number, z?: number): this {
    if (z === undefined) {
      const v = x as CVector3;
      this.object3js.position.set(v.x, v.y, v.z);
    } else {
      this.object3js.position.set(x as number, y!, z);
    }
    return this;
  }

  public getComponentByType<T extends IComponent>(type: number): T|null {
    for (let i = 0; i < this._components.length; i += 1) {
      if (this._components[i].type === type) {
        return this._components[i] as T;
      }
    }

    return null;
  }

  public addChild(child: Entity): this {
    child.setParent(this);
    this.object3js.add(child.object3js);
    this._children.push(child);
    return this;
  }

  public removeChild(entity: Entity): this {
    const index = this.children.indexOf(entity);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.object3js.remove(entity.object3js);
      entity.setParent(null);
    }

    return this;
  }

  public addComponent(component: IComponent): this {
    this.components.push(component);
    component.onAttach(this);
    component.active?.();
    return this;
  }

  public removeComponent(component: IComponent): this {
    const index = this.components.indexOf(component);
    if (index !== -1) {
      component.inactive?.();
      this.children.splice(index, 1);
      component.onDetach(this);
    }

    return this;
  }

  public update(deltaTime: number): void {
    for (let i = 0; i < this._components.length; i += 1) {
      const comp = this._components[i];
      if (comp.update) {
        comp.update(deltaTime);
      }
    }

    for (let i = 0; i < this._children.length; i += 1) {
      this._children[i].update(deltaTime);
    }
  }
}
