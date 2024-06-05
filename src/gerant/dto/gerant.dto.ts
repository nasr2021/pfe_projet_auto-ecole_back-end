import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GerantDto {
    @ApiProperty()
    @IsNotEmpty()
    idGerant: number;
}