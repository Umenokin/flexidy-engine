// import { IOrbitControls } from 'flexidy-engine';
// import { OrbitControls as OrbitControls3JS } from '../../three/OrbitControls';
// // import { OrbitControls as OrbitControls3JSO } from 'three/examples/jsm/controls/OrbitControls';
// import { Entity } from '../../entity';

// export class OrbitControls implements IOrbitControls {
//   private controls3js: OrbitControls3JS;

//   constructor(entity: Entity, viewport: HTMLElement) {
//     this.controls3js = new OrbitControls3JS(entity.object3js, viewport);
//   }

//   public update(): void {

//   }
// }

import { IOrbitControls } from 'flexidy-engine';
import { OrbitControls as OrbitControls3JS } from './OrbitControls';

// import { OrbitControls as OrbitControls3JSO } from 'three/examples/jsm/controls/OrbitControls';
import { Entity } from '../../entity';

export class OrbitControls implements IOrbitControls {
  private controls: OrbitControls3JS;

  constructor(entity: Entity, viewport: HTMLElement) {
    this.controls = new OrbitControls3JS(entity, viewport);
  }

  public update(): void {

  }
}
