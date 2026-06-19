import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/public.module';
import { RegisterDto } from '../../dto/register.dto';
import { AuthService } from '../../services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(
    @Request()
    request: {
      user: { id: number; phone: string; userType: import('src/users/utils/user-type').UserType };
    },
  ) {
    return this.authService.login(request.user);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
