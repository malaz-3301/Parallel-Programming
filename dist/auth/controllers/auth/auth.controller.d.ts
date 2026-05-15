import { AuthService } from '../../services/auth/auth.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
    }>;
}
