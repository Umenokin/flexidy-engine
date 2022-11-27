import { Clock } from 'three/src/core/Clock';
import { IEngine } from 'flexidy-engine-base';
import { EventEmitter } from 'flexidy-engine-base/event-emitter';
import { SceneManager } from './scenes/scene-manager';

export class Engine extends EventEmitter implements IEngine {
  private _sceneManager: SceneManager|null = null;

  public get sceneManager(): SceneManager {
    if (!this._sceneManager) {
      throw new Error('Resource manager was not set');
    }

    return this._sceneManager;
  }

  public set sceneManager(rm: SceneManager) {
    this._sceneManager = rm;
  }

  constructor() {
    super();
    this.on('start', this._start.bind(this));
  }

  public start(): void {
    this.emit('start');
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
}
