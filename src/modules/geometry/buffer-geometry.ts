import { BufferGeometry as BufferGeometry3JS } from 'three/src/core/BufferGeometry';
import { BoxGeometry as BoxGeometry3JS } from 'three/src/geometries/BoxGeometry';
import { IBufferGeometry } from 'flexidy-engine';

export class BufferGeometry implements IBufferGeometry {
  public readonly geometry3js: BufferGeometry3JS;

  constructor(
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1,
  ) {
    this.geometry3js = new BoxGeometry3JS(width, height, depth, widthSegments, heightSegments, depthSegments);
  }
}
