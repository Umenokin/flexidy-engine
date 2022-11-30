import {
  MeshPhysicalMaterial as PhysicalMaterial3JS,
  MeshPhysicalMaterialParameters as PhysicalMaterialParameters3JS,
} from 'three/src/materials/MeshPhysicalMaterial';
import type { IPhysicalMaterial, PhysicalMaterialParams } from 'flexidy-engine-base/interfaces/materials/physical-material';
import { convertStandardParams } from './standard-material';
import { Material } from './material';

export function convertPhysicalParams(params?: PhysicalMaterialParams): PhysicalMaterialParameters3JS|undefined {
  return {
    ...convertStandardParams(params),
  };
}

export class PhysicalMaterial extends Material<PhysicalMaterial3JS> implements IPhysicalMaterial {
  constructor(params?: PhysicalMaterialParams) {
    super(new PhysicalMaterial3JS(convertPhysicalParams(params)));
  }

  public dispose(): void {
    throw new Error('Needs to be implemented');
  }
}
