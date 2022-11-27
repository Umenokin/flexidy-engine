import {
  MeshStandardMaterial as StandardMaterial3JS,
  MeshStandardMaterialParameters as StandardMaterialParams3JS } from 'three/src/materials/MeshStandardMaterial';
import type { IStandardMaterial, StandardMaterialParams } from 'flexidy-engine';
import { Cast } from '../casts/math';

import { convertMaterialParams, Material } from './material';

export function convertStandardParams(params?: StandardMaterialParams): StandardMaterialParams3JS|undefined {
  const params3js: StandardMaterialParams3JS = {
    ...convertMaterialParams(params),
  };

  if (!params) {
    return params3js;
  }

  if (params.diffuse) {
    params3js.color = Cast.color.to3js(params.diffuse);
  }

  if (params.emissive) {
    params3js.emissive = Cast.color.to3js(params.emissive);
  }

  if (params.emissiveIntensity) {
    params3js.emissiveIntensity = params.emissiveIntensity;
  }

  return params3js;
}

export class StandardMaterial extends Material<StandardMaterial3JS> implements IStandardMaterial {
  constructor(params?: StandardMaterialParams) {
    super(new StandardMaterial3JS(convertStandardParams(params)));
  }
}
