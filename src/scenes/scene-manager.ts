import type {
  SceneAsset,
  SceneResources,
  MaterialAsset,
  GeometryAsset,
  IAssetLoader,
  ISceneManager,
} from 'flexidy-engine-base';

import { Loader, SharedResources } from '../assets/loaders/loader';
import { BoxGeometryLoader } from '../assets/loaders/geometry/box-geometry-loader';
import { StandardMaterialLoader } from '../assets/loaders/materials/standard-material-loader';
import { EmbeddedMeshLoader } from '../assets/loaders/meshes/embedded-mesh-loader';
import { NodeLoader } from '../assets/loaders/scenes/node-loader';
import { SceneLoader } from '../assets/loaders/scenes/scene-loader';
import { Material } from '../materials';
import { BufferGeometry } from '../geometry';
import { AssetLoader } from '../assets/asset-loader';

import { Scene } from './scene';

export class SceneManager implements ISceneManager {
  private _scenes = new Map<string, Scene>();

  private _resources: SharedResources = {
    materials: new Map<string, Material>(),
    geometry: new Map<string, BufferGeometry>(),
  };

  public get scenes(): IterableIterator<Scene> {
    return this._scenes.values();
  }

  getScene(path: string): Scene | null {
    return this._scenes.get(path) || null;
  }

  constructor(
    private assetLoader: IAssetLoader = new AssetLoader(),
  ) {
    Loader.add('geometry.box', new BoxGeometryLoader());
    Loader.add('meshes.embedded', new EmbeddedMeshLoader());
    Loader.add('materials.standard', new StandardMaterialLoader());
    Loader.add('scenes.node', new NodeLoader());
    Loader.add('scenes.scene', new SceneLoader());
  }

  public async loadScene(path: string, progressCallback: (progress: number) => void = () => {}): Promise<Scene> {
    progressCallback(0);
    let scene = this._scenes.get(path);
    if (scene) {
      progressCallback(100);
      return scene;
    }

    const sceneAsset: SceneAsset = await this.assetLoader.loadAsset(path);

    let totalResourcesCount = Object.keys(sceneAsset.params.resources.materials).length
      + Object.keys(sceneAsset.params.resources.geometry).length;

    const resourcesTotalRange = 80;
    const resourceProgressScalar = resourcesTotalRange / totalResourcesCount;

    progressCallback(10);

    await this.loadResources(sceneAsset.params.resources, (loadedCount) => {
      totalResourcesCount -= loadedCount;
      progressCallback(Math.floor(90 - totalResourcesCount * resourceProgressScalar));
      console.log('Scene loaded: ', Math.floor(90 - totalResourcesCount * resourceProgressScalar));
    });

    scene = Loader.deserialize(sceneAsset, this._resources) as Scene;
    console.log('!!!!!!!!!!!!! SCENE LOADED !!!!!!!!!!!!!!');
    progressCallback(100);

    this._scenes.set(path, scene);
    return scene;
  }

  private async loadResources(sceneResources: SceneResources, loadedCallback: (loadedCount: number) => void): Promise<void> {
    const materials = await Promise.all(Object.values(sceneResources.materials).map((path) => this.loadMaterial(path)));
    Object.keys(sceneResources.materials).forEach((uuid, index) => this._resources.materials.set(uuid, materials[index]));
    loadedCallback(materials.length);

    const geometry = await Promise.all(Object.values(sceneResources.geometry).map((asset) => this.loadGeometry(asset)));
    Object.keys(sceneResources.geometry).forEach((uuid, index) => this._resources.geometry.set(uuid, geometry[index]));
    loadedCallback(geometry.length);
  }

  private async loadMaterial(path: string): Promise<Material> {
    const asset = await this.assetLoader.loadAsset<MaterialAsset>(path);
    return Loader.deserialize(asset, this._resources);
  }

  // TODO add static meshes loading
  private async loadGeometry(geometryAsset: GeometryAsset): Promise<BufferGeometry> {
    return Loader.deserialize(geometryAsset, this._resources);
  }
}
