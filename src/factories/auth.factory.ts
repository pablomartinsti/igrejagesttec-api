import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';

export class AuthFactory {
  private static authService: AuthService;

  static getServiceInstance(): AuthService {
    if (this.authService) return this.authService;
    this.authService = new AuthService();
    return this.authService;
  }

  static getControllerInstance(): AuthController {
    return new AuthController(this.getServiceInstance());
  }
}
