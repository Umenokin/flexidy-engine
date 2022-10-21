import { Material as Material3JS } from 'three/src/materials/Material';
import { IMaterial } from 'flexidy-engine';

export class Material<TMat = Material3JS> implements IMaterial {
  public material3js: TMat;

  constructor(material: TMat) {
    this.material3js = material;
  }
}
