import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class PackDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    nom_forfait: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    nombre_compte?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    nombre_candidat?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    nombre_sms?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    nombre_notification?: number;

    @ApiProperty()
    @IsOptional()
    prix: string | number;
}
