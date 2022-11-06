import { MeshStandardMaterial, MeshStandardMaterialParameters } from 'three/src/materials/MeshStandardMaterial';
import { IStandardMaterial, StandardMaterialParams } from 'flexidy-engine';
import { Cast } from '../../casts/math';

import { convertMaterialParams, Material } from './material';

export function convertStandardParams(params?: StandardMaterialParams): MeshStandardMaterialParameters|undefined {
  const params3js: MeshStandardMaterialParameters = {
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

export class StandardMaterial<TMat = MeshStandardMaterial> extends Material<TMat> implements IStandardMaterial {

}
