import { MeshPhysicalMaterial, MeshPhysicalMaterialParameters } from 'three/src/materials/MeshPhysicalMaterial';
import { IPhysicalMaterial, PhysicalMaterialParams } from 'flexidy-engine';
import { convertStandardParams, StandardMaterial } from './standard-material';

export function convertPhysicalParams(params?: PhysicalMaterialParams): MeshPhysicalMaterialParameters|undefined {
  return {
    ...convertStandardParams(params),
  };
}

export class PhysicalMaterial extends StandardMaterial<MeshPhysicalMaterial> implements IPhysicalMaterial {

}
