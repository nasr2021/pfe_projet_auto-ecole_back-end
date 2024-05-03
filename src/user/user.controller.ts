import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { User } from "./user.model";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/auth.guard";
import { Roles } from '../auth/roles.decorator';
import { AuthMiddleware } from "src/auth/AuthMiddleware";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";


@Controller('api/user')

export class UserController {
    constructor(private readonly userService: UserService) {}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    
    @Get()
    async getAllUser(@Req() request: Request, @Res() response: Response, @Req() req: Request & { user: { sub: number } }): Promise<any> {
        console.log('req.user', req.user);
        const idCompteConnecte = req.user.sub;
        console.log('idCompteConnecte', idCompteConnecte)
        const result = await this.userService.getAllUser(idCompteConnecte); // Fournir l'idCompteConnecte à la méthode
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
    async updateUser(@Param('id') idUser: number, @Body() postData: User): Promise<User> {
        return this.userService.updateUser(idUser, postData);
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(AuthMiddleware)
    @Get('account')
async getUserByAccount(@Query('account') account: string, @Req() req: Request & { user: { sub: number } }): Promise<User[] | null> {
    console.log('account:', account);
    let isAccountTrue: boolean | null = null;

    if (account === 'true') {
        isAccountTrue = true;
    } else if (account === 'false') {
        isAccountTrue = false;
    }

    console.log('isAccountTrue:', isAccountTrue);
    console.log('req.user', req.user);
    const idCompteConnecte = req.user.sub;
    console.log('idCompteConnecte', idCompteConnecte)
    if (isAccountTrue !== null) {
        const users = await this.userService.getUserByAccount(isAccountTrue, idCompteConnecte);
        console.log('users:', users);
        return users !== null ? users : null;
    } else {
        console.log('Calling getAllUser');
        return this.userService.getAllUser(idCompteConnecte);
    }
}
@UseGuards(AuthGuard('jwt'))
@UseGuards(AuthMiddleware)
@Get('user/autoecole')
async getAllUsersByAutoEcoleId(@Req() req: Request & { user: { sub: number } }): Promise<User[]> {
  const userId = req.user.sub;
  return this.userService.getAllUsersByAutoEcoleId(userId);
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
    // @Get('account')
    // async getUserByAccount(@Query('account') account: string,@Req() req: Request & { user: { sub: number } }): Promise<User[] | null> {
    //     console.log('account:', account);
    //     let isAccountTrue: boolean | null = null;
    
    //     if (account === 'true') {
    //         isAccountTrue = true;
    //     } else if (account === 'false') {
    //         isAccountTrue = false;
    //     }
    
    //     console.log('isAccountTrue:', isAccountTrue);
    //     console.log('req.user', req.user);
    //     const idCompteConnecte = req.user.sub;
    //     console.log('idCompteConnecte', idCompteConnecte)
    //     if (isAccountTrue !== null) {
    //         const user = await this.userService.getUserByAccount(isAccountTrue,idCompteConnecte);
    //         console.log('user:', user);
    //         return user ? [user] : null;
    //     } else {
    //         console.log('Calling getAllUser');
    //         return this.userService.getAllUser(idCompteConnecte);
    //     }
    // }
    
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
    

   
}