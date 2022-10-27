import { IEditorModule } from 'flexidy-engine';
import { OrbitController } from './orbit-controller';

export default class EditorModule implements IEditorModule {
  createOrbitController(viewport: HTMLElement): OrbitController {
    return new OrbitController(viewport);
  }
}
