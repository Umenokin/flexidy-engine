import {
  IScene,
  ISceneNode,
  IScenesModule,
  IRaycaster,
  ScenesModuleBase,
} from 'flexidy-engine';

import { SceneNode } from './scene-node';
import { Scene } from './scene';
import { Raycaster } from './raycaster';

export default class ScenesModule extends ScenesModuleBase implements IScenesModule {
  public createSceneNode(uuid?: string, name?: string): ISceneNode {
    return new SceneNode(uuid, name);
  }

  public createRaycaster(): IRaycaster {
    return new Raycaster();
  }

  protected nativeCreateScene(uuid?: string, name?: string): IScene {
    return new Scene(uuid, name);
  }
}
