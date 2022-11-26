/* eslint-disable no-param-reassign */
import { Object3D } from 'three/src/core/Object3D';
import { ISceneNode, DEG2RAD, CVector3, Vector3, Quaternion, IScene } from 'flexidy-engine';
import { IComponent } from 'flexidy-engine/component';
import { Matrix4 } from 'flexidy-engine/math/matrix4';

// function node() {
//   console.log('node(): factory evaluated');

//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     console.log('node(): called', target: any, propertyKey: string, descriptor: PropertyDescriptor);
//   };
// }

export class SceneNode<TObject extends Object3D = Object3D> implements ISceneNode {
  private _isAwaken: boolean = false;

  private _parent: ISceneNode|null = null;

  private _children: ISceneNode[] = [];

  private _components: IComponent[] = [];

  public enabled: boolean = true;

  public get uuid(): string {
    return this.object3js.uuid;
  }

  public get name(): string|undefined {
    return this.object3js.name;
  }

  public get parent(): ISceneNode|null {
    return this._parent;
  }

  private setParent(parent: ISceneNode|null) {
    this._parent = parent;
  }

  public get parentScene(): IScene|null {
    return this._parent?.parentScene || null;
  }

  public get children(): ISceneNode[] {
    return this._children;
  }

  public get components(): IComponent[] {
    return this._components;
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

  public getComponentByType<T extends IComponent>(type: number): T|null {
    for (let i = 0; i < this._components.length; i += 1) {
      if (this._components[i].type === type) {
        return this._components[i] as T;
      }
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

  public addComponent(component: IComponent): this {
    this.components.push(component);
    component.onAttach(this);
    component.onActive?.();
    return this;
  }

  public removeComponent(component: IComponent): this {
    const index = this.components.indexOf(component);
    if (index !== -1) {
      component.onInactive?.();
      this.children.splice(index, 1);
      component.onDetach(this);
    }

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
