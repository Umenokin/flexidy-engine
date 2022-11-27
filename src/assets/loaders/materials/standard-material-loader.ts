import type { StandardMaterialAsset } from 'flexidy-engine/assets/materials/standard-material-asset';
import { StandardMaterial } from '../../../materials/standard-material';
import { Loader } from '../loader';

export class StandardMaterialLoader extends Loader<StandardMaterialAsset, StandardMaterial> {
  public deserialize({ params }: StandardMaterialAsset): StandardMaterial {
    return new StandardMaterial(params);
  }
}
