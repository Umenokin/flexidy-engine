import { Object3D } from 'three/src/core/Object3D';
import { Scene as Scene3JS } from 'three/src/scenes/Scene';
import { IScene, ISceneNode, IScenesModule, ScenesModuleBase } from 'flexidy-engine';
import { SceneNode } from './scene-node';
import { Scene } from './scene';

export default class ScenesModule extends ScenesModuleBase implements IScenesModule {
  createSceneNode(uuid?: string, name?: string): ISceneNode {
    const object3d = new Object3D();
    if (uuid) {
      object3d.uuid = uuid;
    }

    if (name) {
      object3d.name = name;
    }

    return new SceneNode(object3d);
  }

  protected nativeCreateScene(uuid?: string, name?: string): IScene {
    const scene3d = new Scene3JS();

    if (uuid) {
      scene3d.uuid = uuid;
    }

    if (name) {
      scene3d.name = name;
    }

    return new Scene(scene3d);
  }
}
