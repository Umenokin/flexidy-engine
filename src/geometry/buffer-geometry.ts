import { BufferGeometry as BufferGeometry3JS } from 'three/src/core/BufferGeometry';
import type { IBufferGeometry } from 'flexidy-engine-base';

export class BufferGeometry<TGeom extends BufferGeometry3JS = any> implements IBufferGeometry {
  constructor(public readonly geometry3js: TGeom) {}
}
