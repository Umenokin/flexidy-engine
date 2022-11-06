import { PerspectiveCamera as PerspectiveCamera3JS } from 'three/src/cameras/PerspectiveCamera';
import { OrthographicCamera as OrthographicCamera3JS } from 'three/src/cameras/OrthographicCamera';
import { DirectionalLight as DirectionalLight3JS } from 'three/src/lights/DirectionalLight';
import { ColorRepresentation, IRenderingModule, RendererOptions } from 'flexidy-engine';
import { OrthographicCamera } from './cameras/orthographic-camera';
import { PerspectiveCamera } from './cameras/perspective-camera';
import { Renderer } from './renderer';
import { DirectionalLight } from './lights/directional-light';
import { Cast } from '../../casts/math';

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

    const renderer = new Renderer(opt);
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
    c3js.rotateY(Math.PI);
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

  public createDirectionalLight(color?: ColorRepresentation, intensity?: number): DirectionalLight {
    const light3js = new DirectionalLight3JS(color && Cast.color.to3js(color), intensity);
    return new DirectionalLight(light3js);
  }
}
