import { AssetFile, IResourcesModule, ResourcesModuleBase } from 'flexidy-engine';

export default class ResourcesModule extends ResourcesModuleBase implements IResourcesModule {
  loadAsset<Type extends AssetFile<string, unknown>>(_path: string): Promise<Type> {
    throw new Error('Method not implemented.');
  }
}
