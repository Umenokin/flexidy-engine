import { Light as Light3JS } from 'three/src/lights/Light';
import type { ILight } from 'flexidy-engine-base/interfaces/scenes/lights/light';
import { SceneComponent } from '../scene-component';

export abstract class Light<TLight extends Light3JS = Light3JS> extends SceneComponent<TLight> implements ILight {
  abstract dispose(): void;
}
