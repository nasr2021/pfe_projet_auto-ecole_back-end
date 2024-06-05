import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { User } from "./user.model";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/auth.guard";
import { Roles } from '../auth/roles.decorator';
import { AuthMiddleware } from "src/auth/AuthMiddleware";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { UserDto } from "./dto";
import { cars, condidat, moniteur } from "@prisma/client";
import { FileInterceptor } from "@nestjs/platform-express";

import { Express } from 'express'; 
import { UpdatePasswordWithOTPDto } from "src/auth/dto";
@Controller('api/user')

export class UserController {
 
    constructor(private readonly userService: UserService) {}
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File): Promise<string> {
      try {
        if (!file) {
          throw new BadRequestException('No file uploaded');
        }
        console.log('fileback', file)
        const base64Data = file.buffer.toString('base64');
      
        const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

        const avatarUrl = await this.userService.saveAvatar(dataUrl);
        console.log('avatarUrl', avatarUrl)
        return avatarUrl;
    
      } catch (error) {
        console.error('Error uploading avatar:', error.message);
        throw error;
      }
    }

    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    
    @Get()
    async getAllUser(@Req() request: Request, @Res() response: Response, @Req() req: Request & { user: { sub: number } }): Promise<any> {
        console.log('req.user', req.user);
        const idCompteConnecte = req.user.sub;
        console.log('idCompteConnecte', idCompteConnecte)
        const result = await this.userService.getAllUser(idCompteConnecte); 
        return response.status(200).json({
            status: "ok",
            message: "Successfully fetched data!",
            result: result
        });
    }    

     @UseGuards(AuthGuard('jwt'))
     @Post()
     @UseGuards(AuthMiddleware) 
     async createUser(@Body() userData: any, @Req() req: Request & { user: { sub: number } }): Promise<User> 
     {console.log('req.user',req.user);
       const idCompteConnecte = req.user.sub;
       console.log('idCompteConnecte',idCompteConnecte)
       const user = await this.userService.createUser(userData, idCompteConnecte);
       console.log('user',user)
       return user;
     }
    @UseGuards(AuthMiddleware)
    
    @UseGuards(AuthGuard('jwt'))
    @Delete(':idUser')
    async deleteUser(@Param('idUser') idUser: number): Promise<User> {
        return this.userService.deleteUser(idUser);
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async updateUser(@Param('id') idUser: number, @Body() postData: UserDto): Promise<User> {
        console.log('avatar', postData.avatar)
      return this.userService.updateUser(Number(idUser), postData);
    }

@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Get('user/autoecole')
async getAllUsersByAutoEcoleId(@Req() req: Request & { user: { sub: number,idRole:string } }): Promise<User[]> {
  console.log('aaa', req.user);
  
    const userId = req.user.sub;
    
    const roleId = req.user.idRole;
    console.log("userId2", userId);
  return this.userService.getAllUsersByAutoEcoleId(Number(userId), roleId);
}
@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Get('user/autoecole/:role')
async getAllUsersByAutoEcoleIdAndRole(
  @Param('role') role: string,
  @Req() req: Request & { user: { sub: number } }
): Promise<User[]> {
  const userId = req.user.sub;
  return this.userService.getAllUsersByAutoEcoleIdAndRole(role, userId);
}
@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Get('moniteur')
async getMoniteur(
  @Req() req: Request & { user: { sub: number } }
): Promise<moniteur[]> {
  const userId = req.user.sub;
  return this.userService.getMoniteur( userId);
}

@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Get('condidat')
async getCandidat(
  @Req() req: Request & { user: { sub: number } }
): Promise<condidat[]> {
  const userId = req.user.sub;
  return this.userService.getCandidat( userId);
}
    @Get(':idUser')
async getUserById(@Param('idUser') idUser: string): Promise<User | null> {
    console.log('idUser:', idUser);
    const userId = parseInt(idUser, 10); 
    console.log('userId:', userId);
    if (isNaN(userId)) {
        console.log('Invalid idUser. Expected number, received string');
        throw new BadRequestException('Invalid idUser. Expected number, received string');
    }
    console.log('Calling getUserById with userId:', userId);
    return this.userService.getUserById(userId);
}
@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Post('update-password-with-otp')
async updatePasswordWithOTP(@Body() dto: UpdatePasswordWithOTPDto): Promise<{ message: string }> {
  try {
    await this.userService.updatePasswordWithOTP(dto);
    return { message: 'Password updated successfully with OTP.' };
  } catch (error) {
    throw new HttpException('Failed to update password with OTP.', HttpStatus.BAD_REQUEST);
  }
}
@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Post('generate-and-send-otp')
async generateAndSendOTP( @Req() req: Request & { user: { sub: number } }): Promise<{ message: string }> {
try {
  const userId = req.user.sub;
  console.log('userId', userId)
  await this.userService.generateAndSendOTP(Number(userId));
  return { message: 'OTP sent successfully.' };
} catch (error) {
  console.error('Failed to generate and send OTP:', error);
  throw new Error('Failed to generate and send OTP.');
}
}
   
}