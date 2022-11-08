import { Clock } from 'three/src/core/Clock';
import { Object3D } from 'three/src/core/Object3D';
import { defaultModules, EngineBase, ModuleType, ModulesManager } from 'flexidy-engine';
import { Scene } from './scene';
import { SceneNode } from './scene-node';

export class Engine extends EngineBase {
  constructor() {
    super();
    this.on('start', this._start.bind(this));
  }

  public createSceneNode(uuid?: string): SceneNode {
    const object3d = new Object3D();
    if (uuid) {
      object3d.uuid = uuid;
    }
    return new SceneNode(object3d);
  }

  protected nativeCreateScene(): Scene {
    console.log('### Create scene');
    return new Scene();
  }

  private _start(): void {
    console.log('Start rendering loop');

    const clock = new Clock(true);

    const renderFrame = (): void => {
      this.emit('update', clock.getDelta());
      this.emit('render');

      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  public static async loadModules(modules: ModuleType[] = defaultModules): Promise<void> {
    const moduleClasses = await Promise.all(modules.map((module) => import(`./modules/${module}/module.js`)));
    console.log('moduleClasses:', moduleClasses);

    const modulesHash: Record<string, any> = {};
    modules.forEach((module, index) => {
      modulesHash[module] = moduleClasses[index].default;
    });

    ModulesManager.setModules(modulesHash);
  }
}
