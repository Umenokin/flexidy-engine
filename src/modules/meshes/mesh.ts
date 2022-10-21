import { Mesh as Mesh3JS } from 'three/src/objects/Mesh';
import { IMesh } from 'flexidy-engine';
import { Entity } from '../../entity';
import { BufferGeometry } from '../geometry/buffer-geometry';
import { Material } from '../materials/material';

export class Mesh extends Entity implements IMesh {
  constructor(geometry?: BufferGeometry, material?: Material) {
    const mesh3js = new Mesh3JS(geometry?.geometry3js, material?.material3js);
    super(mesh3js);
  }
}
