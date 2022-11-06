import { Scene as Scene3JS } from 'three/src/scenes/Scene';
import { IScene } from 'flexidy-engine';
import { SceneNode } from './scene-node';

export class Scene extends SceneNode<Scene3JS> implements IScene {
  // private behaviors: Behavior[] = [];

  public get parentScene(): IScene | null {
    return this;
  }

  constructor() {
    super(new Scene3JS());
  }

  // public addBehavior(behavior: Behavior): void {
  //  this.behaviors.push(behavior);
  // }

  // public removeBehavior(behavior: Behavior): void {
  //   const index = this.behaviors.indexOf(behavior);

  //   if (index !== -1) {
  //     this.behaviors.splice(index, 1);
  //   }
  // }
}
