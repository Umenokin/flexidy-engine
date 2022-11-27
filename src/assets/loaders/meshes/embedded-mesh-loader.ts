import type { EmbeddedMeshAsset } from 'flexidy-engine-base/assets/meshes/embedded-mesh-asset';
import { Mesh } from '../../../meshes';
import { Loader, SharedResources } from '../loader';

export class EmbeddedMeshLoader extends Loader<EmbeddedMeshAsset, Mesh> {
  public deserialize({ params }: EmbeddedMeshAsset, resources: SharedResources): Mesh {
    const geom = resources.geometry.get(params.geometry);
    const mat = resources.materials.get(params.material);
    return new Mesh(geom, mat);
  }
}
