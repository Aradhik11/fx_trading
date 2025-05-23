import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class VerifyDto {
    @ApiProperty({
        description: 'Verification token received via email',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsUUID()
    token: string;
} 