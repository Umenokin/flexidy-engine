import { Object3D } from 'three/src/core/Object3D';
import { IComponent } from 'flexidy-engine/component';
import { SceneNode } from './modules/scenes/scene-node';

export abstract class SceneComponent<TObject extends Object3D = Object3D> implements IComponent {
  public readonly abstract type: number;

  constructor(public readonly object3js: TObject) {}

  public onAttach(parent: SceneNode): void {
    parent.object3js.add(this.object3js);
  }

  public onDetach(parent: SceneNode): void {
    parent.object3js.remove(this.object3js);
  }
}
