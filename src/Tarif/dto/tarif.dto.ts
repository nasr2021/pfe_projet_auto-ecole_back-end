import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TarifDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    tarif: string | number;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    nomService?: string;
}
