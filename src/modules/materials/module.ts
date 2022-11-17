import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { IMaterialsModule, Module, PhysicalMaterialParams, StandardMaterialParams } from 'flexidy-engine';
import { convertPhysicalParams, PhysicalMaterial } from './physical-material';
import { convertStandardParams, StandardMaterial } from './standard-material';

export default class MaterialsModule extends Module implements IMaterialsModule {
  public createStandardMaterial(parameters?: StandardMaterialParams): StandardMaterial {
    const material3js = new MeshStandardMaterial(convertStandardParams(parameters));
    return new StandardMaterial(material3js);
  }

  public createPhysicalMaterial(parameters?: PhysicalMaterialParams): PhysicalMaterial {
    const material3js = new MeshPhysicalMaterial(convertPhysicalParams(parameters));
    return new PhysicalMaterial(material3js);
  }
}
