import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AutoecoleDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nom: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    adresse: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    ville: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    code_postal: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    pays: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    telephone: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    email: string;

    @ApiProperty()
    @IsOptional()
    idCompteConnecte: number;

    @ApiProperty()
    @IsOptional()
    idForfait: number;

    @ApiProperty()
    @IsOptional()
    idUser: number;

    @ApiProperty()
    @IsOptional()
    sms: number;
    @ApiProperty()
    @IsOptional()
    moniteurs:number;
    @ApiProperty()
    @IsOptional()
    temp_historique: Date;

}