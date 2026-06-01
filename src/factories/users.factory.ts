import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';

export class UsersFactory {
  private static usersService: UsersService;

  static getServiceInstance(): UsersService {
    if (this.usersService) return this.usersService;
    this.usersService = new UsersService();
    return this.usersService;
  }

  static getControllerInstance(): UsersController {
    return new UsersController(this.getServiceInstance());
  }
}
