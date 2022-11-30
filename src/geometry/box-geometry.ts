import { BoxGeometry as BoxGeometry3JS } from 'three/src/geometries/BoxGeometry';
import { BufferGeometry } from './buffer-geometry';

export class BoxGeometry extends BufferGeometry<BoxGeometry3JS> {
  constructor(
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1,
  ) {
    super(new BoxGeometry3JS(width, height, depth, widthSegments, heightSegments, depthSegments));
  }

  public dispose(): void {
    throw new Error('Needs to be implemented');
  }
}
