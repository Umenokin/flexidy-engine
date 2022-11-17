import { Clock } from 'three/src/core/Clock';
import { defaultModules, EngineBase, ModuleType, ModulesManager } from 'flexidy-engine';

export class Engine extends EngineBase {
  constructor() {
    super();
    this.on('start', this._start.bind(this));
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

    modules.forEach((module, index) => {
      ModulesManager.addModule(module, moduleClasses[index].default);
    });
  }
}
