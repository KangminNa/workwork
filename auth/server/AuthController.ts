import { Controller } from '../../core/server/decorators/index.js';
import { BaseController } from '../../core/server/BaseController.js';
import { UserService } from './UserService.js';
import { CreateUserDto } from './dto/CreateUserDto.js';
import { LoginDto } from './dto/LoginDto.js';

/**
 * 회원가입 Controller
 */
@Controller('http', '/api/auth/register')
export class RegisterController extends BaseController {
  protected type = 'http' as const;

  constructor(
    private userService: UserService
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const dto: CreateUserDto = req.body;
      const user = await this.userService.register(dto);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

/**
 * 로그인 Controller
 */
@Controller('http', '/api/auth/login')
export class LoginController extends BaseController {
  protected type = 'http' as const;

  constructor(
    private userService: UserService
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const dto: LoginDto = req.body;
      const user = await this.userService.login(dto);
      
      // TODO: 실제로는 JWT 토큰을 생성하여 반환해야 함
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: user,
        // token: generateJWT(user.id)
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

