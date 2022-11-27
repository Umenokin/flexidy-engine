import type { BoxGeometryAsset } from 'flexidy-engine/assets/geometry/box-geometry-asset';
import { BoxGeometry, BufferGeometry } from '../../../geometry';
import { Loader } from '../loader';

export class BoxGeometryLoader extends Loader<BoxGeometryAsset, BufferGeometry> {
  public deserialize({ params }: BoxGeometryAsset): BufferGeometry {
    return new BoxGeometry(
      params.width,
      params.height,
      params.depth,
      params.widthSegments,
      params.heightSegments,
      params.depthSegments,
    );
  }
}
