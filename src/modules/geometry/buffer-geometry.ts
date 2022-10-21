import { BufferGeometry as BufferGeometry3JS } from 'three/src/core/BufferGeometry';
import { IBufferGeometry } from 'flexidy-engine';

export class BufferGeometry implements IBufferGeometry {
  public readonly geometry3js: BufferGeometry3JS;

  constructor(geometry: BufferGeometry3JS) {
    this.geometry3js = geometry;
  }
}
