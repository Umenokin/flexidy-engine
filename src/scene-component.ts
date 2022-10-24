import { Object3D } from 'three/src/core/Object3D';
import { IComponent } from 'flexidy-engine/component';
import { Entity } from './entity';

export class SceneComponent<TObject extends Object3D = Object3D> implements IComponent {
  constructor(public readonly object3js: TObject) {}

  public onAttach(parent: Entity): void {
    parent.object3js.add(this.object3js);
  }

  public onDetach(parent: Entity): void {
    parent.object3js.remove(this.object3js);
  }
}
