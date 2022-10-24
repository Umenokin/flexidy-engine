import { Camera as Camera3JS } from 'three/src/cameras/Camera';
import { ICamera } from 'flexidy-engine/modules/rendering/cameras/camera';
import { SceneComponent } from '../../../scene-component';

export class Camera<TCam extends Camera3JS = Camera3JS> extends SceneComponent<TCam> implements ICamera {

}
