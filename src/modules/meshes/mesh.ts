import { Mesh as Mesh3JS } from 'three/src/objects/Mesh';
import { IMesh } from 'flexidy-engine/modules/meshes/mesh';
import { MESH_COMPONENT_TYPE } from 'flexidy-engine/constants';
import { BufferGeometry } from '../geometry/buffer-geometry';
import { Material } from '../materials/material';
import { SceneComponent } from '../../scene-component';

export class Mesh extends SceneComponent<Mesh3JS> implements IMesh {
  public readonly type = MESH_COMPONENT_TYPE;

  constructor(geometry?: BufferGeometry, material?: Material) {
    super(new Mesh3JS(geometry?.geometry3js, material?.material3js));
  }
}
