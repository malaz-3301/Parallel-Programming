import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth/auth.controller';
import { JwtStrategy } from './utils/JwtStrategy';
import { LocalStrategy } from './utils/LocalStrategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth/auth.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './utils/JwtGuard';
@Module({
  imports: [UsersModule, PassportModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      global: true,
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any }

    }),
  }), ConfigModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuthService, JwtStrategy, LocalStrategy
  ],
})
export class AuthModule { }