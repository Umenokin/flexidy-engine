import { MeshStandardMaterial, MeshStandardMaterialParameters } from 'three/src/materials/MeshStandardMaterial';
import { IStandardMaterial, StandardMaterialParams } from 'flexidy-engine';
import { Cast } from '../../casts/math';

import { Material } from './material';

export function convertStandardParams(params?: StandardMaterialParams): MeshStandardMaterialParameters|undefined {
  return params ? {
    color: params.diffuse && Cast.color.to3js(params.diffuse),
    emissive: params.emissive && Cast.color.to3js(params.emissive),
    emissiveIntensity: params.emissiveIntensity || 1,
  } : undefined;
}

export class StandardMaterial<TMat = MeshStandardMaterial> extends Material<TMat> implements IStandardMaterial {

}
