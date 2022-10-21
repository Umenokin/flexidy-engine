import { Camera as Camera3JS } from 'three/src/cameras/Camera';
import { ICamera } from 'flexidy-engine/modules/rendering/cameras/camera';
import { Entity } from '../../../entity';

export class Camera<TCam extends Camera3JS = Camera3JS> extends Entity<TCam> implements ICamera {

}
