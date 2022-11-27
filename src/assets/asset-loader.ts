import { AssetFile } from 'flexidy-engine-base/assets/asset-file';
import type { IAssetLoader } from 'flexidy-engine-base/assets/asset-loader';

export class AssetLoader implements IAssetLoader {
  loadAsset<Type extends AssetFile<string, unknown>>(_path: string): Promise<Type> {
    throw new Error('Method not implemented.');
  }
}
