import { OrthographicCamera as Camera3JS } from 'three/src/cameras/OrthographicCamera';
import { IOrthographicCamera } from 'flexidy-engine';
import { Camera } from './camera';

export class OrthographicCamera<TCamera extends Camera3JS = Camera3JS> extends Camera<TCamera> implements IOrthographicCamera {

}
