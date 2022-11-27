import type { Asset } from 'flexidy-engine-base/assets/asset';
import { BufferGeometry } from '../../geometry';
import { Material } from '../../materials';

export type SharedResources = {
  materials: Map<string, Material>;
  geometry: Map<string, BufferGeometry>;
};

export abstract class Loader<TAsset extends Asset<any, any>, TObject> {
  public abstract deserialize(asset: TAsset, resources: SharedResources): TObject;

  private static loaders: Record<string, Loader<Asset<string, any>, any>> = {};

  public static add(path: string, loader: Loader<Asset<string, any>, any>) {
    Loader.loaders[path] = loader;
  }

  public static deserialize<TObject>(asset: Asset<string, any>, resources: SharedResources): TObject {
    const loader = Loader.loaders[asset.type] as Loader<Asset<string, TObject>, TObject>;
    if (!loader) {
      throw new Error(`Unknown "${asset.type}" asset type provided`);
    }

    return loader.deserialize(asset, resources);
  }
}
