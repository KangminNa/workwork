import { Controller } from '../../core/server/decorators/index.js';
import { BaseController } from '../../core/server/BaseController.js';
import { UserService } from './UserService.js';

/**
 * 사용자 목록 조회 Controller
 */
@Controller('http', '/api/users')
export class UsersController extends BaseController {
  protected type = 'http' as const;

  constructor(
    private userService: UserService
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const users = await this.userService.getAllUsers();
      
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

/**
 * 사용자 상세 조회 Controller
 */
@Controller('http', '/api/users/:id')
export class UserDetailController extends BaseController {
  protected type = 'http' as const;

  constructor(
    private userService: UserService
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

