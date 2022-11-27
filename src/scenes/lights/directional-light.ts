import { ColorValue } from 'flexidy-engine-base/math/color';
import { DirectionalLight as DirectionalLight3JS } from 'three/src/lights/DirectionalLight';
import type { IDirectionalLight } from 'flexidy-engine-base/scenes/lights/directional-light';
import { Light } from './light';
import { Cast } from '../../casts/math';

export class DirectionalLight extends Light<DirectionalLight3JS> implements IDirectionalLight {
  constructor(color?: ColorValue, intensity?: number) {
    super(new DirectionalLight3JS(color && Cast.color.to3js(color), intensity));
  }
}
