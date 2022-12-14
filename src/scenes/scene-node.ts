/* eslint-disable no-param-reassign */
import { Object3D } from 'three/src/core/Object3D';
import { DEG2RAD  } from 'flexidy-engine-base/core/math/math';
import { CVector3, Vector3 } from 'flexidy-engine-base/core/math/vector3';
import { Quaternion } from 'flexidy-engine-base/core/math/quaternion';
import { Matrix4 } from 'flexidy-engine-base/core/math/matrix4';
import { ISceneNode } from 'flexidy-engine-base/interfaces/scenes/scene-node';
import { ComponentConstructor, IComponent } from 'flexidy-engine-base/interfaces/component';
import type { Scene } from './scene';

// function node() {
//   console.log('node(): factory evaluated');

//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     console.log('node(): called', target: any, propertyKey: string, descriptor: PropertyDescriptor);
//   };
// }

export class SceneNode implements ISceneNode {
  private _isAwaken: boolean = false;

  private _parent: SceneNode|null = null;

  private _children: SceneNode[] = [];

  private _components: IComponent[] = [];

  private _componentsHash = new Map<ComponentConstructor<IComponent>, number>();

  public readonly object3js: Object3D;

  public get uuid(): string {
    return this.object3js.uuid;
  }

  public get name(): string|undefined {
    return this.object3js.name;
  }

  public get parent(): SceneNode|null {
    return this._parent;
  }

  private setParent(parent: SceneNode|null) {
    this._parent = parent;
  }

  public get parentScene(): Scene|null {
    return this._parent?.parentScene || null;
  }

  public get children(): SceneNode[] {
    return this._children;
  }

  public get components(): IComponent[] {
    return this._components;
  }

  constructor(uuid?: string, name?: string) {
    this.object3js = this.initObject(uuid, name);
    this.object3js.userData = { node: this };
  }

  public dispose(): void {
    this.object3js.userData = {};
    this._components.forEach((component) => component.dispose());
    this._children.forEach((child) => child.dispose());
  }

  protected initObject(uuid?: string, name?: string): Object3D {
    const object3d = new Object3D();
    if (uuid) {
      object3d.uuid = uuid;
    }

    if (name) {
      object3d.name = name;
    }

    return object3d;
  }

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

  public getPosition(out = new Vector3()): Vector3 {
    const pos = this.object3js.position;
    return out.set(pos.x, pos.y, pos.z);
  }

  public getQuaternion(out = new Quaternion()): Quaternion {
    const qaut = this.object3js.quaternion;
    return out.set(qaut.x, qaut.y, qaut.z, qaut.w);
  }

  public getUp(out = new Vector3()): Vector3 {
    const up = this.object3js.up;
    return out.set(up.x, up.y, up.z);
  }

  public getMatrix(out = new Matrix4()): Matrix4 {
    return out.fromArray(this.object3js.matrix.elements);
  }

  public getWorldMatrix(out: Matrix4): Matrix4 {
    return out.fromArray(this.object3js.matrixWorld.elements);
  }

  public getComponent<T extends IComponent>(Type: ComponentConstructor<T>): T|null {
    const oneBaseIndex =  this._componentsHash.get(Type);
    if (oneBaseIndex) {
      return this._components[oneBaseIndex - 1] as T;
    }

    return null;
  }

  public addChild(child: SceneNode): this {
    child.setParent(this);
    this.object3js.add(child.object3js);
    this._children.push(child);
    return this;
  }

  public removeChild(child: SceneNode): this {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.object3js.remove(child.object3js);
      child.setParent(null);
    }

    return this;
  }

  public addComponent<T extends IComponent>(component: T): this {
    const constructor = component.constructor as ComponentConstructor<T>;
    if (this._componentsHash.has(constructor)) {
      return this;
    }

    this.components.push(component);
    this._componentsHash.set(constructor, this.components.length);
    component.onAttach(this);
    component.onActive?.();
    return this;
  }

  public removeComponent<T extends IComponent>(component: T): this {
    const constructor = component.constructor as ComponentConstructor<T>;
    const oneBasedIndex = this._componentsHash.get(constructor);

    if (!oneBasedIndex) {
      return this;
    }

    this._componentsHash.delete(constructor);

    const index = oneBasedIndex - 1;
    component.onInactive?.();
    this.children.splice(index, 1);
    component.onDetach(this);

    return this;
  }

  public update(deltaTime: number): void {
    for (let i = 0; i < this._components.length; i += 1) {
      const component = this._components[i];
      if (component.enabled && component.onUpdate) {
        component.onUpdate(deltaTime);
      }
    }

    for (let i = 0; i < this._children.length; i += 1) {
      this._children[i].update(deltaTime);
    }
  }

  public awake(): void {
    console.log('Awake');

    if (this._isAwaken) {
      return;
    }

    this._isAwaken = true;
    const children = this._children;
    const count = children.length;

    for (let i = 0; i < count; i += 1) {
      children[i].awake();
    }
  }
}
