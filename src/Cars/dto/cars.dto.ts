import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CarsDto {


    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    marque: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    modele: string;

    @ApiProperty()
    @IsOptional()
   
    annee?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    couleur?: string;


    @ApiProperty()
    @IsOptional()
    @IsString()
    statut?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    iduserconnecte?: number;
    @ApiProperty()
    @IsOptional()
    image?:string;
}
