import { PerspectiveCamera as PerspectiveCamera3JS } from 'three/src/cameras/PerspectiveCamera';
import { OrthographicCamera as OrthographicCamera3JS } from 'three/src/cameras/OrthographicCamera';
import { IRenderingModule, RendererOptions } from 'flexidy-engine';
import { OrthographicCamera } from './cameras/orthographic-camera';
import { PerspectiveCamera } from './cameras/perspective-camera';
import { Renderer } from './renderer';

export default class RenderingModule implements IRenderingModule {
  private renderers = new Map<string, Renderer>();

  public getRenderer(name: string): Renderer|null {
    return this.renderers.get(name) || null;
  }

  public createRenderer(name: string, options?: RendererOptions): Renderer {
    const opt = options || {
      antialias: true,
    };

    if (this.renderers.has(name)) {
      throw new Error(`Renderer with name "${name}" already exists`);
    }

    const renderer = this.nativeCreateRenderer(opt);
    this.renderers.set(name, renderer);
    return renderer;
  }

  public createPerspectiveCamera(
    fov?: number,
    aspect?: number,
    near?: number,
    far?: number,
  ): PerspectiveCamera {
    const c3js = new PerspectiveCamera3JS(fov, aspect, near, far);
    return new PerspectiveCamera(c3js);
  }

  public createOrthographicCamera(
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
    near?: number,
    far?: number,
  ): OrthographicCamera {
    const c3js = new OrthographicCamera3JS(left, right, top, bottom, near, far);
    return new OrthographicCamera(c3js);
  }

  protected nativeCreateRenderer(options: RendererOptions): Renderer {
    return new Renderer(options);
  }
}
