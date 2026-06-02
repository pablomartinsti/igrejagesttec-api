import { RelatoriosController } from '../controllers/relatorios.controller';
import { RelatoriosService } from '../services/relatorios.service';

export class RelatoriosFactory {
  private static relatoriosService: RelatoriosService;

  static getServiceInstance(): RelatoriosService {
    if (this.relatoriosService) return this.relatoriosService;
    this.relatoriosService = new RelatoriosService();
    return this.relatoriosService;
  }

  static getControllerInstance(): RelatoriosController {
    return new RelatoriosController(this.getServiceInstance());
  }
}
