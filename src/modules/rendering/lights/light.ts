import { Light as Light3JS } from 'three/src/lights/Light';
import { ILight } from 'flexidy-engine/modules/rendering/lights/light';
import { SceneComponent } from '../../../scene-component';

export abstract class Light<TLight extends Light3JS = Light3JS> extends SceneComponent<TLight> implements ILight {
  public abstract readonly type: number;
}
