import { Raycaster as Raycaster3JS } from 'three/src/core/Raycaster';
import { IComponent } from 'flexidy-engine-base/interfaces/component';
import { IRaycaster, IntersectInfo } from 'flexidy-engine-base/interfaces/scenes/raycaster';
import { CVector2 } from 'flexidy-engine-base/core/math/vector2';
import { List } from 'flexidy-engine-base/core/collections/list';
import { Camera } from './cameras/camera';
import { SceneNode } from './scene-node';

export class Raycaster implements IRaycaster {
  private raycaster3js: Raycaster3JS;

  constructor() {
    this.raycaster3js = new Raycaster3JS();
  }

  public setFromCamera(coords: CVector2, camera: Camera): void {
    this.raycaster3js.setFromCamera(coords, camera.object3js);
  }

  public intersectNode(node: SceneNode, recursive: boolean, intersects: List<IntersectInfo<SceneNode, IComponent>>): List<IntersectInfo> {
    return intersects;
  }
}
