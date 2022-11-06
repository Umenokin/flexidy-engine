import { Color as Color3JS } from 'three/src/math/Color';
import { Vector3 as Vector33JS } from 'three/src/math/Vector3';

import { Color, Vector3, Immutable, ColorRepresentation } from 'flexidy-engine';

const _tempColor3js = new Color3JS();
const _tempVector33js = new Vector33JS();

const _tempVector3 = new Vector3();

export const Cast = {
  color: {
    to3js(color: ColorRepresentation): Immutable<Color3JS> {
      const c = color as Color;
      if (c.r !== undefined) {
        return _tempColor3js.setRGB(c.r, c.g, c.b);
      }

      return _tempColor3js.set(color as any);
    },
  },

  vec3: {
    to3js(vector: Vector3): Immutable<Vector33JS> {
      return _tempVector33js.set(vector.x, vector.y, vector.z);
    },

    from3js(vector3js: Vector33JS): Immutable<Vector3|undefined> {
      return _tempVector3.set(vector3js.x, vector3js.y, vector3js.z);
    },
  },
};
