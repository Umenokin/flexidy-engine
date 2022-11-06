import { DirectionalLight as Light3JS } from 'three/src/lights/DirectionalLight';
import { IDirectionalLight } from 'flexidy-engine/modules/rendering/lights/directional-light';
import { DIRECTIONAL_LIGHT_TYPE } from 'flexidy-engine/constants';
import { Light } from './light';

export class DirectionalLight<TLight extends Light3JS = Light3JS> extends Light<TLight> implements IDirectionalLight {
  public readonly type = DIRECTIONAL_LIGHT_TYPE;
}
