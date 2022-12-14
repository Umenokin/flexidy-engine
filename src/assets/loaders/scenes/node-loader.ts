import { IComponent } from 'flexidy-engine-base';
import type { SceneNodeAsset } from 'flexidy-engine-base/assets/scenes/scene-node-asset';
import { CVector3 } from 'flexidy-engine-base/core/math/vector3';
import { SceneNode } from '../../../scenes/scene-node';
import { Loader, SharedResources } from '../loader';

export class NodeLoader extends Loader<SceneNodeAsset, SceneNode> {
  public deserialize({ params }: SceneNodeAsset, resources: SharedResources): SceneNode {
    const { uuid, name, position, components, children } = params;
    const node = new SceneNode(uuid, name);
    node.setPosition(position as CVector3);

    components
      .filter((comp) => comp.type === 'meshes.embedded')
      .forEach((comp) => node.addComponent(Loader.deserialize(comp, resources) as IComponent));

    children.forEach((child) => node.addChild(Loader.deserialize(child, resources)));

    return node;
  }
}
