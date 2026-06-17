import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { JwtAuthGuard } from './utils/JwtGuard';
import { JwtStrategy } from './utils/JwtStrategy';
import { LocalStrategy } from './utils/LocalStrategy';
import { RolesGuard } from './utils/roles.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '1h';

        return {
          global: true,
          secret:
            configService.get<string>('JWT_SECRET') ??
            configService.get<string>('SECRET') ??
            'development-secret',
          signOptions: {
            expiresIn: expiresIn as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
})
export class AuthModule {}
