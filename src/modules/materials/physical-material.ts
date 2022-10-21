import { MeshPhysicalMaterial, MeshPhysicalMaterialParameters } from 'three/src/materials/MeshPhysicalMaterial';
import { IPhysicalMaterial, PhysicalMaterialParams } from 'flexidy-engine';
import { convertStandardParams, StandardMaterial } from './standard-material';

export function convertPhysicalParams(params?: PhysicalMaterialParams): MeshPhysicalMaterialParameters|undefined {
  return params ? {
    ...convertStandardParams(params),
  } : undefined;
}

export class PhysicalMaterial extends StandardMaterial<MeshPhysicalMaterial> implements IPhysicalMaterial {

}
