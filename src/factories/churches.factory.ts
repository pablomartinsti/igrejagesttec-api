import { ChurchesController } from '../controllers/churches.controller';
import { ChurchesService } from '../services/churches.service';

export class ChurchesFactory {
  private static churchesService: ChurchesService;

  static getServiceInstance(): ChurchesService {
    if (this.churchesService) return this.churchesService;
    this.churchesService = new ChurchesService();
    return this.churchesService;
  }

  static getControllerInstance(): ChurchesController {
    return new ChurchesController(this.getServiceInstance());
  }
}
