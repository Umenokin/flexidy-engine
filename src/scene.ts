import { Scene as TreeScene } from 'three/src/scenes/Scene';
import { IScene } from 'flexidy-engine';
import { Entity } from './entity';

export class Scene implements IScene {
  public scene3js: THREE.Scene;

  constructor() {
    this.scene3js = new TreeScene();
  }

  public add(entity: Entity) {
    console.log('Add object:', entity.object3js);
    this.scene3js.add(entity.object3js);
  }
}
