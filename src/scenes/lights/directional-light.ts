import { ColorValue } from 'flexidy-engine-base/core/math/color';
import { DirectionalLight as DirectionalLight3JS } from 'three/src/lights/DirectionalLight';
import type { IDirectionalLight } from 'flexidy-engine-base/interfaces/scenes/lights/directional-light';
import { Light } from './light';
import { Cast } from '../../casts/math';

export class DirectionalLight extends Light<DirectionalLight3JS> implements IDirectionalLight {
  constructor(color?: ColorValue, intensity?: number) {
    super(new DirectionalLight3JS(color && Cast.color.to3js(color), intensity));
  }

  public dispose(): void {
    throw new Error('Needs to be implemented');
  }
}
