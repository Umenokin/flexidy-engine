import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { IRenderer, RendererOptions } from 'flexidy-engine';
import { Scene } from '../scenes/scene';
import { Camera } from './cameras/camera';

export class Renderer implements IRenderer {
  private renderer3js: THREE.WebGLRenderer;

  constructor(options: RendererOptions) {
    this.renderer3js = new WebGLRenderer(options);
  }

  public setSize(width: number, height: number): void {
    this.renderer3js.setSize(width, height);
  }

  public render(scene: Scene, camera: Camera): void {
    this.renderer3js.render(scene.object3js, camera.object3js);
  }
}
