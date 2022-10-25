import { IEditorModule } from 'flexidy-engine';
import { Entity } from '../../entity';
import { OrbitControls } from './orbit-controls';

export default class EditorModule implements IEditorModule {
  createOrbitControls(entity: Entity, viewport: HTMLElement): OrbitControls {
    return new OrbitControls(entity, viewport);
  }
}
