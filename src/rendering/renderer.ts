import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import type { IRenderer, RendererOptions } from 'flexidy-engine-base/interfaces/rendering/renderer';
import { Scene } from '../scenes/scene';
import { Camera } from '../scenes/cameras/camera';

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

  public dispose(): void {
    throw new Error('Needs to be implemented');
  }
}
