import { IEditorModule, Module } from 'flexidy-engine';
import { OrbitController } from './orbit-controller';

export default class EditorModule extends Module implements IEditorModule {
  createOrbitController(viewport: HTMLElement): OrbitController {
    return new OrbitController(viewport);
  }
}
