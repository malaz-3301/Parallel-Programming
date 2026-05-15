import { Body, Controller, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../services/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { log } from 'node:console';
import { Public } from 'src/public.module';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Post('login')
    @Public()
    @UseGuards(AuthGuard('local'))
    login(@Request() req) {
        return this.authService.login(req.user);
    }
    @Post('register')
    @Public()
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }
}