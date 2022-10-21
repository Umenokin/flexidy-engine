import { Color as Color3JS } from 'three/src/math/Color';

import { Color, Immutable } from 'flexidy-engine';

const _tempColor3js = new Color3JS();

export const Cast = {
  color: {
    to3js(color?: Color): Immutable<Color3JS|undefined> {
      return color ? _tempColor3js.setRGB(color.r, color.g, color.b) : undefined;
    },
  },
};
