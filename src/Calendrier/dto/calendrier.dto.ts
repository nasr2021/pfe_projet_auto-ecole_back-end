import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDate, IsInt } from 'class-validator';

export class CalendrierDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nom_evenement: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type?: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    date_debut: Date;

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    date_fin: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsOptional()
    idCompteConnecte?: number;

    @ApiProperty()
    @IsOptional()
    idAutoEcole?: number;

    @ApiProperty()
    @IsOptional()
    idVoiture?: number;
    
    @ApiProperty()
    @IsOptional()
    idUser?: number;
    @ApiProperty()
    @IsOptional()
    idMoniteur?: number;
}
