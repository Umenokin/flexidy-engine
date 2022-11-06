import { MeshBasicMaterial, MeshBasicMaterialParameters } from 'three/src/materials/MeshBasicMaterial';
import { IBasicMaterial, BasicMaterialParams } from 'flexidy-engine';
import { convertMaterialParams, Material } from './material';

// color?: ColorRepresentation | undefined;
// opacity?: number | undefined;
// map?: Texture | null | undefined;
// lightMap?: Texture | null;
// lightMapIntensity?: number | undefined;
// aoMap?: Texture | null | undefined;
// aoMapIntensity?: number | undefined;
// specularMap?: Texture | null | undefined;
// alphaMap?: Texture | null | undefined;
// fog?: boolean | undefined;
// envMap?: Texture | null | undefined;
// combine?: Combine | undefined;
// reflectivity?: number | undefined;
// refractionRatio?: number | undefined;
// wireframe?: boolean | undefined;
// wireframeLinewidth?: number | undefined;
// wireframeLinecap?: string | undefined;
// wireframeLinejoin?: string | undefined;

export function convertBasicParams(params?: BasicMaterialParams): MeshBasicMaterialParameters|undefined {
  const defaults: MeshBasicMaterialParameters = {
    fog: false,
  };

  return params ? {
    ...convertMaterialParams(params),
    ...defaults,
  } : defaults;
}

export class StandardMaterial<TMat = MeshBasicMaterial> extends Material<TMat> implements IBasicMaterial {

}
