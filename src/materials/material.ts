import { Material as Material3JS, MaterialParameters as MaterialParameters3JS } from 'three/src/materials/Material';
import type { IMaterial, MaterialParams } from 'flexidy-engine-base/interfaces/materials/material';

export function convertMaterialParams(params?: MaterialParams): MaterialParameters3JS|undefined {
  if (!params) {
    return;
  }

  const params3js: MaterialParameters3JS = {};

  if (params.depthTest) {
    params3js.depthTest = params.depthTest;
  }

  if (params.depthWrite) {
    params3js.depthWrite = params.depthWrite;
  }

  if (params.toneMapped) {
    params3js.toneMapped = params.toneMapped;
  }

  if (params.transparent) {
    params3js.transparent = params.transparent;
  }

  return params3js;
}

export abstract class Material<TMat extends Material3JS = any> implements IMaterial {
  public material3js: TMat;

  constructor(material: TMat) {
    this.material3js = material;
  }

  abstract dispose(): void;
}
