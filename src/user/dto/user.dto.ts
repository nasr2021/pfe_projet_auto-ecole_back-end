import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Decimal } from '@prisma/client/runtime'; 
export class UserDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    nom: string;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    date_naissance?: Date;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    compte?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    date_prise_permis?: Date;
    @ApiProperty()
    @IsOptional()
    @IsString()
    prenom: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    numero_telephone1?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    numero_telephone2?: string;

    @ApiProperty()
    @IsOptional()
    idRole: number;

    @ApiProperty()
    @IsOptional()
    nombre_heures_conduit?: number;
    @ApiProperty()
    @IsOptional()
    idCompteConnecte?: number;
    @ApiProperty()
    @IsOptional()
    nombre_heures_code?: number;
    @ApiProperty()
    @IsOptional()
    nombre_fois_conduit?: number;
    @ApiProperty()
    @IsOptional()
    nombre_fois_code?: number;
    @ApiProperty()
    @IsOptional()
    idCandidat?: number;
    @ApiProperty()
    @IsOptional()
    idCompte?: number;
    @ApiProperty()
    @IsOptional()
    idForfaitAchete?: number;

    @ApiProperty()
    @IsOptional()
    experience?: number;
    @ApiProperty()
    @IsOptional()
    nombre_candidat?: number;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    ids_candidats_participes?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    qualification?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    adresse?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    services_offerts?: string; 
       
    @ApiProperty()
    @IsOptional()
    @IsString()
    cin?: string;
       
    @ApiProperty()
    @IsOptional()
    @IsString()
    genre?: string;
           
    @ApiProperty()
    @IsOptional()
    @IsString()
    emploi?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    numero_permis?: string;
           
    @ApiProperty()
    @IsOptional()
    @IsString()
    type_permis_pris?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    type_permis_souhaite?: string;
    @ApiProperty()
    @IsOptional()
    roles?: any;
    @ApiProperty()
    @IsOptional()
    avatar?:string;
}