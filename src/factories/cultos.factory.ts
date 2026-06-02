import { CultosController } from '../controllers/cultos.controller';
import { CultosService } from '../services/cultos.service';

export class CultosFactory {
  private static cultosService: CultosService;

  static getServiceInstance(): CultosService {
    if (this.cultosService) return this.cultosService;
    this.cultosService = new CultosService();
    return this.cultosService;
  }

  static getControllerInstance(): CultosController {
    return new CultosController(this.getServiceInstance());
  }
}
