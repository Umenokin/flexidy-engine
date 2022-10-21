import { BoxGeometry as ThreeBoxGeometry } from 'three/src/geometries/BoxGeometry';
import { IGeometryModule } from 'flexidy-engine';
import { BufferGeometry } from './buffer-geometry';

export default class GeometryModule implements IGeometryModule {
  public createBox(
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1,
  ): BufferGeometry {
    return new BufferGeometry(new ThreeBoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments));
  }
}
