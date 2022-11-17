import { IMeshesModule, Module } from 'flexidy-engine';
import { BufferGeometry } from '../geometry/buffer-geometry';
import { Material } from '../materials/material';
import { Mesh } from './mesh';

export default class MeshesModule extends Module implements IMeshesModule {
  public createMesh(geometry?: BufferGeometry, material?: Material): Mesh {
    return new Mesh(geometry, material);
  }
}
