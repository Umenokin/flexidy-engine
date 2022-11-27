import { Raycaster as Raycaster3JS } from 'three/src/core/Raycaster';
import { IRaycaster } from 'flexidy-engine-base';

export class Raycaster implements IRaycaster {
  private raycaster3js: Raycaster3JS;

  constructor() {
    this.raycaster3js = new Raycaster3JS();
  }
}
