import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Render, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, UpdatePasswordWithOTPDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtAuthGuard } from './JwtAuthGuard';
import { AuthMiddleware,AuthenticatedRequest } from './AuthMiddleware';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { NoAuthGuard } from './NoAuthGuard';
@Controller('auth')
export class AuthController {
    constructor(private authservice:AuthService
    ){}
    
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() dto: AuthDto): Promise<Tokens> {
        try {
            const tokens = await this.authservice.signup(dto);
            return tokens;
        } catch (error) {
            throw new Error('Une erreur est survenue lors de l\'inscription');
        }
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: AuthDto): Promise<{ tokens: Tokens, role: string }> {
        try {
            const tokens = await this.authservice.login(dto);
            console.log('...',tokens)
            return tokens;
        } catch (error) {
            console.log('err',error)
            throw new Error('Nom d\'utilisateur ou mot de passe invalide');
        }
    }

    
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: AuthenticatedRequest): Promise<number> {
        try {
            console.log('Tentative de déconnexion avec le token JWT :', req.headers.authorization);
            const userId = req.user?.idUser;
            await this.authservice.logout(userId);
            return HttpStatus.OK;
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
            throw new Error('Une erreur est survenue lors de la déconnexion');
        }
    }
    
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req: AuthenticatedRequest): Promise<Tokens> {
        try {const userId = req.user?.idUser;
            // const compteId = req.user['sub'];
             const refreshToken = req.user?.['refresh_token'];
            const tokens = await this.authservice.refreshToken(userId, refreshToken);
            return tokens;
        } catch (error) {
    
            throw new Error('Une erreur est survenue lors du rafraîchissement du token');
        }
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get('/role')
    async getRoleNameByRoleId(@Req() req: AuthenticatedRequest): Promise<string | null> {
        const roleIdString = req.user?.idRole; 
        const roleId = roleIdString ? parseInt(roleIdString, 10) : null; 
        return this.authservice.getRoleNameByRoleId(roleId);
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(AuthMiddleware)
    @Post('update-password-with-otp')
    async updatePasswordWithOTP(@Body() dto: UpdatePasswordWithOTPDto): Promise<{ message: string }> {
      try {
        console.log('dto',dto)
        await this.authservice.updatePasswordWithOTP(dto);
        return { message: 'Password updated successfully with OTP.' };
      } catch (error) {
        throw new HttpException('Failed to update password with OTP.', HttpStatus.BAD_REQUEST);
      }
    }   
}
