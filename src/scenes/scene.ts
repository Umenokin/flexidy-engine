import { Scene as Scene3JS } from 'three/src/scenes/Scene';
import { Object3D } from 'three/src/core/Object3D';
import { IScene } from 'flexidy-engine-base/interfaces/scenes/scene';
import { SceneNode } from './scene-node';

export class Scene extends SceneNode implements IScene {
  public get parentScene(): Scene | null {
    return this;
  }

  protected initObject(uuid?: string, name?: string): Object3D {
    const object3d = new Scene3JS();
    if (uuid) {
      object3d.uuid = uuid;
    }

    if (name) {
      object3d.name = name;
    }

    return object3d;
  }
}
