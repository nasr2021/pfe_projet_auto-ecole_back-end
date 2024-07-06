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
import { voitures, condidat, moniteur, permi } from "@prisma/client";
import { FileInterceptor } from "@nestjs/platform-express";
import { ForfaitStatistique } from "./user.service";
import { Express } from 'express'; 
import { UpdatePasswordWithOTPDto } from "src/auth/dto";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from 'fs';
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
     @Post('password')
     async forgetPassword(@Body('username') username: string) {   
       console.log('username', username);
       const password = await this.userService.forgetPassword(username);
       console.log('password', password);
       return password;
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
    async updateUser(@Param('id') idUser: number, @Body() postData: any): Promise<User> {
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

  const res= this.userService.getAllUsersByAutoEcoleIdAndRole(role, userId);
  console.log('permi',res)
  return res
  
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
@Get('permi')
async getPermi(
): Promise<permi[]> {
 
  return this.userService.getPermi();
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
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Get('stat')
async getCondidatById(@Req() req: Request & { user: { sub: number, idRole: string } }): Promise<any> {
  const userId = req.user.sub;
  const roleId = req.user.idRole;
  const statsData = await this.userService.getCondidatById(Number(userId), parseInt(roleId, 10));
  console.log('statsData', statsData);
  return statsData;
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
 
@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Post('saveFirebaseToken')
async saveFirebaseToken(@Body() body: { token: string }, @Req() req) {
  const userId = req.user.sub; // Assuming JWT middleware is used to extract user info
  await this.userService.updateUserToken(userId, body.token);
}

@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Get('/id/role')
async getUserByIdStatestique(@Req() req: Request & { user: { sub: number, idRole: string } }) {
  try {
   const userId = req.user.sub;
  const roleId = req.user.idRole;
    
    const result = await this.userService.getUserByIdStatestique(Number(userId), parseInt(roleId));
    
    console.log('result', result);
    
    return result;
  } catch (error) {
    console.error('Error fetching user statistics:', error.message);
    throw new Error(error.message);
  }
}

@Get('getUserStats/:id/:role')
async getTotal(
  @Param('id') id: number, @Param('role') role: number
): Promise<ForfaitStatistique[]> {
  // const userId = req.user.sub;
  // const roleId = req.user.idRole;
  console.log('11', id)
  const res= await this.userService.total(Number(id), Number(role));
  console.log('res', res)
  return res
}

@Get('paiements/:idUser/paiements')
async getPaiementsDernierContrat(@Param('idUser') idUser: string, @Res() res: Response) {
  try {
    const pdfFileName = 'liste_paiements.pdf';
    const pdfFilePath = `./${pdfFileName}`;

    // Generate the PDF
    const pdfBytes = await this.userService.getPaiementDernierContrat(Number(idUser))

    // Save PDF to server
    fs.writeFileSync(pdfFilePath, pdfBytes);

    // Send the file as response
    res.download(pdfFilePath, pdfFileName, (err) => {
      if (err) {
        throw new Error('Error downloading PDF');
      } else {
        // Delete the file after sending it
        fs.unlinkSync(pdfFilePath);
      }
    });

  } catch (error) {
    console.log(`Error generating or downloading PDF: ${error.message}`);
    throw error;
  }
}

}